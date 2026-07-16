import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpDto } from './dto/otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';
import { EmailService } from './email.service';

const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS = 12;

/**
 * AuthService — Complete authentication business logic:
 * - Email/password registration & login
 * - JWT access + refresh token pair
 * - Google OAuth token exchange
 * - OTP generation, verification, and cleanup
 * - Email verification
 * - Password reset flow
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ── Registration ────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: Role.CUSTOMER,
        // Create empty wallet and reward points
        wallet: { create: { balance: 0 } },
        rewardPoints: { create: { points: 0, lifetimeEarned: 0 } },
        wishlist: { create: {} },
        cart: { create: {} },
      },
    });

    // Send email verification (async, non-blocking)
    this.sendEmailVerification(user.id, user.email).catch(() => {});

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Login ────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBanned) {
      throw new UnauthorizedException(
        'Your account has been suspended. Contact support.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Google OAuth ─────────────────────────────────────────────

  async googleLogin(googleUser: {
    email: string;
    name: string;
    picture: string;
    googleId: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      // Create new user from Google profile
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          name: googleUser.name,
          avatar: googleUser.picture,
          emailVerified: new Date(),
          role: Role.CUSTOMER,
          wallet: { create: { balance: 0 } },
          rewardPoints: { create: { points: 0, lifetimeEarned: 0 } },
          wishlist: { create: {} },
          cart: { create: {} },
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: googleUser.googleId,
            },
          },
        },
      });
    } else {
      // Link Google account if not already linked
      const existingAccount = await this.prisma.account.findFirst({
        where: { userId: user.id, provider: 'google' },
      });

      if (!existingAccount) {
        await this.prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleUser.googleId,
          },
        });
      }
    }

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── OTP Login ─────────────────────────────────────────────────

  async sendOtp(email: string) {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous OTPs
    await this.prisma.otpToken.updateMany({
      where: { email, type: 'login', used: false },
      data: { used: true },
    });

    await this.prisma.otpToken.create({
      data: { email, otp, type: 'login', expiresAt },
    });

    // TODO: Send OTP via email service
    // await this.emailService.sendOtp(email, otp);

    return { message: `OTP sent to ${email}` };
  }

  async verifyOtp(dto: OtpDto) {
    const record = await this.prisma.otpToken.findFirst({
      where: {
        email: dto.email,
        otp: dto.otp,
        type: 'login',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.otpToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Get or create user
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.email.split('@')[0],
          emailVerified: new Date(),
          role: Role.CUSTOMER,
          wallet: { create: { balance: 0 } },
          rewardPoints: { create: { points: 0, lifetimeEarned: 0 } },
          wishlist: { create: {} },
          cart: { create: {} },
        },
      });
    }

    const tokens = await this.generateTokenPair(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ── Token Refresh ─────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as unknown as { sub: string };

      if (payload.sub !== userId) {
        throw new UnauthorizedException();
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.isBanned) throw new UnauthorizedException();

      return this.generateTokenPair(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ── Password Reset ────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      return { message: 'If that email exists, a reset link has been sent' };

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.otpToken.create({
      data: { email, otp: token, type: 'reset', expiresAt },
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, token);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.otpToken.findFirst({
      where: {
        otp: dto.token,
        type: 'reset',
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record)
      throw new BadRequestException('Invalid or expired reset token');

    const user = await this.prisma.user.findUnique({
      where: { email: record.email! },
    });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await this.prisma.otpToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { message: 'Password reset successfully' };
  }

  // ── Email Verification ────────────────────────────────────────

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findFirst({
      where: { token, type: 'email', expires: { gt: new Date() } },
    });

    if (!record)
      throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.user.updateMany({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    await this.prisma.verificationToken.delete({ where: { id: record.id } });

    return { message: 'Email verified successfully' };
  }

  // ── Validate User (for LocalStrategy) ─────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  }

  // ── Private Helpers ────────────────────────────────────────────

  private async generateTokenPair(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    const safe = { ...user };
    delete safe.passwordHash;
    delete safe.twoFactorSecret;
    return safe;
  }

  private async sendEmailVerification(userId: string, email: string) {
    const token = this.generateSecureToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.verificationToken.create({
      data: { identifier: email, token, type: 'email', expires },
    });

    // TODO: Send verification email
    // await this.emailService.sendVerification(email, token);
  }
}

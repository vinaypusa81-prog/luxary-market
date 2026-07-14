import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import { AuditLog } from '../models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'admin-super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'admin-refresh-secret-key-change-in-production';
const ACCESS_EXPIRY = (process.env.JWT_EXPIRES_IN as any) || '15m';
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRES_IN as any) || '7d';

const generateTokens = (admin: any) => {
  const payload = { id: admin._id, email: admin.email, role: admin.role, permissions: admin.permissions };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ id: admin._id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || admin.isDeleted || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or inactive account' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(admin);

    // Track activity
    await AuditLog.create({
      adminId: admin._id,
      adminName: admin.name,
      action: 'LOGIN',
      details: `Successful login from admin panel: ${admin.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      passwordHash,
      role: role || 'ADMIN',
      permissions: role === 'MANAGER' ? ['products', 'inventory'] : ['all'],
      isActive: true,
    });

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Refresh token is required' });

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive || admin.isDeleted) {
      return res.status(401).json({ message: 'Admin account inactive or deleted' });
    }

    const tokens = generateTokens(admin);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    await admin.save();

    await AuditLog.create({
      adminId: admin._id,
      adminName: admin.name,
      action: 'CHANGE_PASSWORD',
      details: 'Admin successfully updated password.',
      ipAddress: req.ip
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Email address not found' });

    // Mock response for token generation
    const resetToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Reset instructions generated (in production: email sent)',
      resetToken, // Return for demo ease in local validation
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json({ message: 'Invalid reset link' });

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Password reset completed successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-passwordHash');
    if (!admin) return res.status(404).json({ message: 'Admin profile not found' });
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

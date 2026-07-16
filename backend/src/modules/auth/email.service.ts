import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail = 'LuxeMarket <onboarding@resend.dev>';
  private readonly appUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.appUrl = process.env.APP_URL || 'https://frontend-iota-ten-vzamz1bxn6.vercel.app';
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your LuxeMarket password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Reset your password</title>
            </head>
            <body style="margin:0;padding:0;background:#0d0d1a;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1f2937;border-radius:20px;overflow:hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#1a0a2e,#0d1b2a);">
                          <table width="100%">
                            <tr>
                              <td>
                                <div style="display:inline-flex;align-items:center;gap:8px;">
                                  <div style="background:#c9a96e;width:32px;height:32px;border-radius:10px;display:inline-block;text-align:center;line-height:32px;">
                                    <span style="color:#fff;font-weight:900;font-size:16px;">L</span>
                                  </div>
                                  <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">Luxe<span style="color:#c9a96e;">Market</span></span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h1 style="color:#f9fafb;font-size:22px;font-weight:700;margin:0 0 12px;">Reset your password</h1>
                          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
                            We received a request to reset the password for your LuxeMarket account associated with <strong style="color:#f9fafb;">${email}</strong>. Click the button below to choose a new password.
                          </p>
                          <div style="text-align:center;margin:0 0 28px;">
                            <a href="${resetUrl}"
                               style="display:inline-block;background:#c9a96e;color:#0d0d1a;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                              Reset Password
                            </a>
                          </div>
                          <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0 0 16px;">
                            Or copy and paste this link into your browser:
                          </p>
                          <p style="color:#c9a96e;font-size:11px;word-break:break-all;margin:0 0 28px;">${resetUrl}</p>
                          <div style="border-top:1px solid #1f2937;padding-top:20px;">
                            <p style="color:#6b7280;font-size:12px;margin:0;">
                              This link will expire in <strong style="color:#9ca3af;">1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
                            </p>
                          </div>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding:16px 40px 24px;border-top:1px solid #1f2937;">
                          <p style="color:#4b5563;font-size:11px;margin:0;text-align:center;">
                            &copy; ${new Date().getFullYear()} LuxeMarket. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to LuxeMarket 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:0;background:#0d0d1a;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #1f2937;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:32px 40px 24px;background:linear-gradient(135deg,#1a0a2e,#0d1b2a);">
                          <span style="color:#fff;font-size:20px;font-weight:900;">Luxe<span style="color:#c9a96e;">Market</span></span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h1 style="color:#f9fafb;font-size:22px;font-weight:700;margin:0 0 12px;">Welcome, ${name}! 🎉</h1>
                          <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 28px;">
                            Your LuxeMarket account has been successfully created. You now have access to our exclusive collection of premium fashion brands.
                          </p>
                          <div style="text-align:center;">
                            <a href="${this.appUrl}"
                               style="display:inline-block;background:#c9a96e;color:#0d0d1a;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;">
                              Start Shopping
                            </a>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 40px 24px;border-top:1px solid #1f2937;">
                          <p style="color:#4b5563;font-size:11px;margin:0;text-align:center;">&copy; ${new Date().getFullYear()} LuxeMarket. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${email}`, error);
      // Don't throw — welcome email failure shouldn't block registration
    }
  }
}

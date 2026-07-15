'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, ShieldCheck, Sparkles, Bot, Phone } from 'lucide-react';
import { toast } from 'sonner';

/**
 * LoginPage — Premium brand identity login gateway supporting
 * local credentials validation, passwordless OTP entry, and Google Oauth login.
 */
export default function LoginPage() {
  const [authType, setAuthType] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate api request
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success('Successfully logged in!', { description: `Welcome back!` });
    window.location.href = '/dashboard';
  };

  const sendOtp = () => {
    if (!phone.trim()) {
      toast.error('Please enter your mobile number.');
      return;
    }
    setOtpSent(true);
    toast.success('OTP sent successfully!', { description: 'Check your phone messages.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#1a0a2e] to-primary flex items-center justify-center p-4">
      {/* Visual glowing orb */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-background border border-border/50 rounded-3xl shadow-[var(--shadow-xl)] overflow-hidden"
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center">
                <span className="font-heading text-white font-black">L</span>
              </div>
              <span className="font-heading text-lg font-black text-foreground">
                Luxe<span className="text-accent">Market</span>
              </span>
            </Link>
            <h2 className="text-xl font-bold">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-1">Unlock your luxury style destination</p>
          </div>

          {/* Social buttons */}
          <div className="space-y-2">
            <button
              onClick={() => toast.info('Redirecting to Google Login...')}
              className="btn btn-outline border-border w-full py-2.5 justify-center text-xs flex items-center gap-2"
            >
              <span>🌐</span> Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Or Continue With</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Auth mode selector */}
          <div className="grid grid-cols-2 gap-1 border border-border p-1 rounded-xl bg-muted/40">
            <button
              onClick={() => setAuthType('password')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all
                ${authType === 'password' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Email/Password
            </button>
            <button
              onClick={() => setAuthType('otp')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all
                ${authType === 'otp' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              OTP Login
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authType === 'password' ? (
              /* Password login form */
              <motion.form
                key="password-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="label-base">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="input-base pl-9 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground">Password</label>
                    <Link href="/auth/forgot" className="text-[11px] text-accent hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-base pl-9 py-2.5 text-xs"
                    />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary w-full justify-center mt-2 py-3 text-xs">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              /* OTP Login form */
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="label-base">Mobile Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="input-base pl-9 py-2.5 text-xs"
                    />
                  </div>
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="label-base">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="input-base py-2.5 text-xs"
                    />
                  </motion.div>
                )}

                <button
                  onClick={otpSent ? handleSubmit : sendOtp}
                  disabled={isLoading}
                  className="btn btn-primary w-full justify-center mt-2 py-3 text-xs"
                >
                  {otpSent ? (isLoading ? 'Verifying...' : 'Verify & Log In') : 'Send OTP'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

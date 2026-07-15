'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/utils/apiClient';

/**
 * RegisterPage — Premium brand registration portal with form validation
 * and terms agreement toggles.
 */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast.error('You must agree to the Terms and Conditions.');
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', { name, email, password });
      toast.success('Account created successfully!', { description: 'Welcome to LuxeMarket!' });
      window.location.href = '/login';
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Server may be waking up — try again in 30 seconds.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-[#1a0a2e] to-primary flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

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
            <h2 className="text-xl font-bold">Create Account</h2>
            <p className="text-xs text-muted-foreground mt-1">Join the premier fashion club</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-base pl-9 py-2.5 text-xs"
                />
              </div>
            </div>

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
              <label className="label-base">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 8 chars)"
                  className="input-base pl-9 py-2.5 text-xs"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="rounded text-accent focus:ring-accent border-border mt-0.5"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-accent font-semibold hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-accent font-semibold hover:underline">Privacy Policy</Link>.
              </span>
            </label>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full justify-center mt-2 py-3 text-xs">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

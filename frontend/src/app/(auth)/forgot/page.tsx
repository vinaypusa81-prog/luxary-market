'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import apiClient from '@/utils/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Reset email sent successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send reset email. Server may be waking up — try again in 30 seconds.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 filter blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-1.5 justify-center mb-6">
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs mr-auto">
            <ArrowLeft size={12} /> Back to Sign In
          </Link>
        </div>

        <div className="bg-card/45 backdrop-blur-xl border border-border/40 rounded-3xl p-6 shadow-2xl relative">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Key size={20} />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">Forgot Password?</h1>
          <p className="text-xs text-muted-foreground mb-6">
            Enter your registered email address and we will send you a link to reset your password.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full justify-center mt-2 py-3 text-xs"
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-sm font-semibold text-foreground mb-2">Check your email</div>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                We have sent password reset instructions to <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

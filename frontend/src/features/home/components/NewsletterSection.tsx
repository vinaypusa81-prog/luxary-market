'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * NewsletterSection — Email capture with animated success state
 * and benefit highlights.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
    toast.success('Subscribed successfully!', { description: 'Welcome to LuxeMarket!' });
  };

  return (
    <section className="py-16 relative overflow-hidden" aria-label="Newsletter signup">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-orange-500/5" />

      <div className="container-narrow relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-6">
            <Mail size={24} className="text-accent" />
          </div>

          <h2 className="section-title text-3xl sm:text-4xl mb-4">
            Stay Ahead of the Trend
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Subscribe to get exclusive offers, new arrivals, and personalized style tips
            delivered to your inbox.
          </p>

          {/* Form */}
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="text-xl font-semibold">You're in! 🎉</p>
              <p className="text-muted-foreground">
                Check your inbox for a welcome gift.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="input-base flex-1"
                required
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-accent whitespace-nowrap"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    Subscribe <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            {['No spam, ever', 'Unsubscribe anytime', '10% off first order'].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" /> {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

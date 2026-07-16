import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isForgot, setIsForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.accessToken, data.refreshToken, data.admin);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResetToken(data.resetToken);
      setResetSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword });
      setResetDone(true);
      setTimeout(() => {
        setIsForgot(false);
        setResetSent(false);
        setResetDone(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-premium relative overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />

        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-heading font-black text-2xl mx-auto shadow-[0_4px_12px_rgba(139,0,0,0.3)] mb-4">
            L
          </div>
          <h2 className="text-2xl font-heading font-black tracking-tight">LuxeMarket Admin</h2>
          <p className="text-xs text-muted mt-1.5">
            {isForgot ? 'Recover your dashboard credentials' : 'Sign in to access your administrative dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
            {error}
          </div>
        )}

        {/* ── Forgot Password / Reset Password Form flow ── */}
        {isForgot ? (
          resetSent ? (
            resetDone ? (
              <div className="text-center py-6">
                <span className="text-3xl">🎉</span>
                <h4 className="font-bold text-sm mt-3">Password Reset Successfully!</h4>
                <p className="text-xs text-muted mt-1">Redirecting you to login screen...</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label-title">Enter New Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-muted"><Lock size={16} /></span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm New Password'}
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="label-title">Administrator Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted"><Mail size={16} /></span>
                  <input
                    type="email"
                    placeholder="name@luxemarket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Request Reset Link'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsForgot(false)} className="text-xs text-primary font-semibold hover:underline">
                  Back to Login
                </button>
              </div>
            </form>
          )
        ) : (
          /* ── Default Login Form ── */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-title">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-muted"><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="admin@luxemarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-title mb-0">Password</label>
                <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] text-primary font-bold hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-muted"><Lock size={16} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
            </button>
            <div className="text-center mt-4">
              <a href="/setup" className="text-xs text-muted hover:text-primary font-semibold transition-colors">
                First time? Set up admin account →
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

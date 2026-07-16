import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'EDITOR'>('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', { name, email, password, role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-premium relative overflow-hidden">
        
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />

        {success ? (
          /* ── Success State ── */
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-heading font-black tracking-tight">Admin Created!</h2>
            <p className="text-xs text-muted mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-heading font-black text-2xl mx-auto shadow-[0_4px_12px_rgba(139,0,0,0.3)] mb-4">
                <ShieldCheck size={22} />
              </div>
              <h2 className="text-2xl font-heading font-black tracking-tight">Admin Setup</h2>
              <p className="text-xs text-muted mt-1.5">
                Create your first administrator account to get started
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="label-title">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted"><User size={16} /></span>
                  <input
                    id="setup-name"
                    type="text"
                    placeholder="John Admin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label-title">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted"><Mail size={16} /></span>
                  <input
                    id="setup-email"
                    type="email"
                    placeholder="admin@luxemarket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label-title">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted"><Lock size={16} /></span>
                  <input
                    id="setup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    required
                    minLength={6}
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

              {/* Role */}
              <div>
                <label className="label-title">Admin Role</label>
                <select
                  id="setup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="input-field"
                >
                  <option value="ADMIN">Super Admin — Full Access</option>
                  <option value="MANAGER">Manager — Products & Inventory</option>
                  <option value="EDITOR">Editor — Read & Content Only</option>
                </select>
              </div>

              <button
                id="setup-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Administrator Account'}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-xs text-primary font-semibold hover:underline">
                  Already have an account? Sign in →
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, X, Loader2, Percent, Ticket } from 'lucide-react';

interface CouponData {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export const Coupons: React.FC = () => {
  const { api, user } = useAuth();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Listen for Quick Create event dispatched from Layout topbar
  useEffect(() => {
    const handler = () => handleOpenCreate();
    window.addEventListener('quickCreate', handler);
    return () => window.removeEventListener('quickCreate', handler);
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(0);
    setMinOrderAmount(0);
    setMaxDiscountAmount(undefined);
    setExpiryDate('');
    setUsageLimit(100);
    setIsActive(true);
    setFormOpen(true);
  };

  const handleOpenEdit = (c: CouponData) => {
    setEditingId(c._id);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount);
    setMaxDiscountAmount(c.maxDiscountAmount);
    // Format date string to YYYY-MM-DD
    setExpiryDate(new Date(c.expiryDate).toISOString().split('T')[0]);
    setUsageLimit(c.usageLimit);
    setIsActive(c.isActive);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isActive,
    };

    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
      } else {
        await api.post('/coupons', payload);
      }
      setFormOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleState = async (id: string, currentState: boolean) => {
    try {
      await api.put(`/coupons/${id}/toggle-state`, { isActive: !currentState });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-black tracking-tight">Promotional Coupons</h1>
          <p className="text-xs text-muted mt-1">Configure active percentage/fixed discount coupon rates</p>
        </div>
        {user?.role !== 'EDITOR' && (
          <button onClick={handleOpenCreate} className="btn-primary text-xs">
            <Plus size={14} /> Add Coupon
          </button>
        )}
      </div>

      {/* Coupons Table List */}
      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5 text-xs font-bold text-muted uppercase">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount rate</th>
                <th className="p-4">Minimum Order</th>
                <th className="p-4">Usage Count</th>
                <th className="p-4">Expiration Date</th>
                <th className="p-4">Active State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">No coupons configured.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Ticket size={14} />
                        </div>
                        <span className="font-bold text-foreground font-mono uppercase tracking-wide">{c.code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-foreground">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `INR ${c.discountValue} OFF`}
                      </span>
                    </td>
                    <td className="p-4 text-muted">INR {c.minOrderAmount}</td>
                    <td className="p-4 text-muted font-semibold">{c.usedCount} / {c.usageLimit} uses</td>
                    <td className="p-4 text-muted">{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button onClick={() => handleToggleState(c._id, c.isActive)} className={`px-2.5 py-1 rounded-full text-[9px] font-bold border transition-colors ${
                        c.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {c.isActive ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleOpenEdit(c)} className="p-2 border border-border rounded-lg hover:bg-muted/10 text-muted transition-colors">
                          <Edit3 size={12} />
                        </button>
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleDelete(c._id)} className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Coupon Form Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
              <h3 className="font-heading font-bold text-sm">{editingId ? 'Edit Coupon Campaign' : 'Create New Coupon'}</h3>
              <button onClick={() => setFormOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="label-title">Coupon Code</label>
                <input type="text" placeholder="e.g. LUXE20" value={code} onChange={(e) => setCode(e.target.value)} className="input-field font-mono uppercase" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-title">Discount Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="input-field">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div>
                  <label className="label-title">Discount Value</label>
                  <input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-title">Min Order Amount (INR)</label>
                  <input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="label-title">Max Discount (Optional)</label>
                  <input type="number" value={maxDiscountAmount || ''} onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)} className="input-field" placeholder="No Limit" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-title">Usage Limit</label>
                  <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} className="input-field" required />
                </div>
                <div>
                  <label className="label-title">Expiration Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2 font-semibold">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <span>Enable Coupon Immediately</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

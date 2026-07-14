import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Lock, Mail, Phone, MapPin, Loader2, Image, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Site Configuration State
  const [websiteName, setWebsiteName] = useState('LuxeMarket');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [gstRate, setGstRate] = useState(18.0);
  const [enableTax, setEnableTax] = useState(true);
  const [flatRateCharge, setFlatRateCharge] = useState(150);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);

  // Logo & favicon files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      setWebsiteName(data.websiteName || 'LuxeMarket');
      setContactEmail(data.contactEmail || '');
      setContactPhone(data.contactPhone || '');
      setContactAddress(data.contactAddress || '');
      setGstRate(data.taxSettings?.gstRate || 18.0);
      setEnableTax(data.taxSettings?.enableTax !== false);
      setFlatRateCharge(data.shippingSettings?.flatRateCharge || 150);
      setFreeShippingThreshold(data.shippingSettings?.freeShippingThreshold || 5000);
      setStripeEnabled(data.paymentSettings?.stripeEnabled !== false);
      setRazorpayEnabled(data.paymentSettings?.razorpayEnabled !== false);
      setPaypalEnabled(!!data.paymentSettings?.paypalEnabled);
      setCodEnabled(data.paymentSettings?.codEnabled !== false);
      setLogoPreview(data.logo || '');
      setFaviconPreview(data.favicon || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') return alert('Only Administrators can edit settings.');
    setSaving(true);

    const formData = new FormData();
    const payload = {
      websiteName,
      contactEmail,
      contactPhone,
      contactAddress,
      taxSettings: { gstRate, enableTax },
      shippingSettings: { flatRateCharge, freeShippingThreshold },
      paymentSettings: { stripeEnabled, razorpayEnabled, paypalEnabled, codEnabled },
    };

    formData.append('data', JSON.stringify(payload));
    if (logoFile) formData.append('logo', logoFile);
    if (faviconFile) formData.append('favicon', faviconFile);

    try {
      await api.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Settings updated successfully!');
      fetchSettings();
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading configuration settings...
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 text-xs font-medium">
      
      {/* Left Columns: Site Configs */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-premium">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-heading font-black text-md">General Config Settings</h2>
              <p className="text-[10px] text-muted">Configure storefront titles, contacts, and tax rules</p>
            </div>
            {user?.role === 'ADMIN' && (
              <button onClick={handleSettingsSubmit} disabled={saving} className="btn-primary py-2 text-xs">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
              </button>
            )}
          </div>

          <form className="space-y-6">
            
            {/* Logo uploads */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label-title">Storefront Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-muted/20 border border-border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover" /> : <Image size={18} className="text-muted/30" />}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <input type="file" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setLogoFile(e.target.files[0]);
                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="text-[10px] text-muted" />
                  )}
                </div>
              </div>
              <div>
                <label className="label-title">Site Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted/20 border border-border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {faviconPreview ? <img src={faviconPreview} alt="" className="h-full w-full object-cover" /> : <Image size={14} className="text-muted/30" />}
                  </div>
                  {user?.role === 'ADMIN' && (
                    <input type="file" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFaviconFile(e.target.files[0]);
                        setFaviconPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} className="text-[10px] text-muted" />
                  )}
                </div>
              </div>
            </div>

            {/* General inputs */}
            <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <label className="label-title">Website Name</label>
                <input type="text" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} disabled={user?.role !== 'ADMIN'} className="input-field" />
              </div>
              <div>
                <label className="label-title">Contact Email Address</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled={user?.role !== 'ADMIN'} className="input-field" />
              </div>
              <div>
                <label className="label-title">Support Phone Number</label>
                <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} disabled={user?.role !== 'ADMIN'} className="input-field" />
              </div>
              <div>
                <label className="label-title">Headquarters Address</label>
                <input type="text" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} disabled={user?.role !== 'ADMIN'} className="input-field" />
              </div>
            </div>

            {/* Tax & Shipping */}
            <div className="grid sm:grid-cols-2 gap-6 border-t border-border pt-6">
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-xs text-primary">Taxation Policy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-title">GST Charge Rate (%)</label>
                    <input type="number" step="0.5" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} disabled={user?.role !== 'ADMIN'} className="input-field" />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={enableTax} onChange={(e) => setEnableTax(e.target.checked)} disabled={user?.role !== 'ADMIN'} className="rounded" />
                      <span>Enable Tax Charges</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-heading font-bold text-xs text-primary">Shipping Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-title">Flat Shipping Fee (INR)</label>
                    <input type="number" value={flatRateCharge} onChange={(e) => setFlatRateCharge(Number(e.target.value))} disabled={user?.role !== 'ADMIN'} className="input-field" />
                  </div>
                  <div>
                    <label className="label-title">Free Ship Min Total (INR)</label>
                    <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(Number(e.target.value))} disabled={user?.role !== 'ADMIN'} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Integrations */}
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className="font-heading font-bold text-xs text-primary">Payment Gateways</h3>
              <div className="flex gap-6 flex-wrap font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} disabled={user?.role !== 'ADMIN'} className="rounded" />
                  <span>Stripe Checkout</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={razorpayEnabled} onChange={(e) => setRazorpayEnabled(e.target.checked)} disabled={user?.role !== 'ADMIN'} className="rounded" />
                  <span>Razorpay API</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={paypalEnabled} onChange={(e) => setPaypalEnabled(e.target.checked)} disabled={user?.role !== 'ADMIN'} className="rounded" />
                  <span>PayPal Standard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} disabled={user?.role !== 'ADMIN'} className="rounded" />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* Right Column: Profile & Password Change */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-premium space-y-4">
          <h3 className="font-heading font-bold text-sm">Administrator Profile</h3>
          <div className="flex items-center gap-3 p-4 bg-muted/5 rounded-2xl">
            <div className="h-12 w-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-lg shadow-md">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{user?.name}</p>
              <p className="text-[10px] text-muted">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1 text-[9px] text-green-600 font-extrabold uppercase tracking-wide">
                <ShieldCheck size={12} /> {user?.role} ACCOUNT
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-premium">
          <h3 className="font-heading font-bold text-sm mb-4">Change Account Password</h3>
          
          {passwordError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-semibold">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="p-3 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-semibold">
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label-title">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-title">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-title">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" disabled={passwordLoading} className="btn-primary w-full text-xs mt-2">
              {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Change Password
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

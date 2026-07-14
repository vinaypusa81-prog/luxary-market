import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X, Loader2, Image, MoveUp, MoveDown } from 'lucide-react';

interface BannerData {
  _id: string;
  title: string;
  image: string;
  type: 'SLIDER' | 'HERO' | 'OFFER' | 'SIDEBAR';
  link: string;
  order: number;
}

export const Banners: React.FC = () => {
  const { api, user } = useAuth();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'SLIDER' | 'HERO' | 'OFFER' | 'SIDEBAR'>('SLIDER');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners');
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Listen for Quick Create event dispatched from Layout topbar
  useEffect(() => {
    const handler = () => handleOpenCreate();
    window.addEventListener('quickCreate', handler);
    return () => window.removeEventListener('quickCreate', handler);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleOpenCreate = () => {
    setTitle('');
    setType('SLIDER');
    setLink('');
    setFile(null);
    setPreview('');
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('An image file is required.');
    setSubmitting(true);

    const formData = new FormData();
    const payload = {
      title,
      type,
      link,
      order: banners.length + 1,
    };

    formData.append('data', JSON.stringify(payload));
    formData.append('image', file);

    try {
      await api.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReorder = async (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === banners.length - 1) return;

    const list = [...banners];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Swap items
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    // Compile new orders
    const bannerOrders = list.map((b, i) => ({ id: b._id, order: i + 1 }));
    setBanners(list); // local quick update

    try {
      await api.put('/banners/reorder', { bannerOrders });
    } catch (err) {
      console.error(err);
      fetchBanners(); // revert on fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-black tracking-tight">Banner Placements</h1>
          <p className="text-xs text-muted mt-1">Configure sliders, advertisement blocks, and storefront links</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={handleOpenCreate} className="btn-primary text-xs">
            <Plus size={14} /> Add Placement
          </button>
        )}
      </div>

      {/* Grid listing */}
      <div className="grid md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center text-xs text-muted py-8">
            <Loader2 className="animate-spin inline mr-2" size={16} /> Loading placements...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-2 text-center text-xs text-muted py-8">No placements added.</div>
        ) : (
          banners.map((b, idx) => (
            <div key={b._id} className="bg-card border border-border p-4 rounded-2xl shadow-premium hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
              
              {/* Graphic Banner */}
              <div className="h-48 w-full bg-muted/20 border border-border/50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                <img src={b.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute top-3 left-3 bg-card border border-border text-[9px] font-bold px-2 py-0.5 rounded-full capitalize">{b.type.toLowerCase()}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <div>
                  <h3 className="font-heading font-bold text-foreground text-sm">{b.title}</h3>
                  <p className="text-[10px] text-muted mt-0.5 font-mono">Redirect: {b.link || '/'}</p>
                </div>
                
                {/* Operations */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {user?.role === 'ADMIN' && (
                    <>
                      <button disabled={idx === 0} onClick={() => handleReorder(idx, 'up')} className="p-2 border border-border hover:bg-muted/10 rounded-lg disabled:opacity-30">
                        <MoveUp size={12} />
                      </button>
                      <button disabled={idx === banners.length - 1} onClick={() => handleReorder(idx, 'down')} className="p-2 border border-border hover:bg-muted/10 rounded-lg disabled:opacity-30">
                        <MoveDown size={12} />
                      </button>
                      <button onClick={() => handleDelete(b._id)} className="p-2 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-500 rounded-lg ml-1">
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* ── Banner Form Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
              <h3 className="font-heading font-bold text-sm">Add Placements</h3>
              <button onClick={() => setFormOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="label-title">Placement Artwork / Graphic</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-20 bg-muted/20 border border-border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Image size={18} className="text-muted/30" />}
                  </div>
                  <input type="file" onChange={handleFileChange} className="text-[10px] text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" required />
                </div>
              </div>
              <div>
                <label className="label-title">Placement Title</label>
                <input type="text" placeholder="e.g. Summer Couture Banner" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-title">Placement Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="input-field">
                    <option value="SLIDER">Homepage Slider</option>
                    <option value="HERO">Hero Banner</option>
                    <option value="OFFER">Offer Card</option>
                    <option value="SIDEBAR">Sidebar Ad</option>
                  </select>
                </div>
                <div>
                  <label className="label-title">Target Redirect Link</label>
                  <input type="text" placeholder="e.g. /sale" value={link} onChange={(e) => setLink(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

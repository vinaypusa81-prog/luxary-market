import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit3, Trash2, X, Loader2, Image } from 'lucide-react';

interface BrandData {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  isActive: boolean;
}

export const Brands: React.FC = () => {
  const { api, user } = useAuth();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/brands');
      setBrands(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Listen for Quick Create event dispatched from Layout topbar
  useEffect(() => {
    const handler = () => handleOpenCreate();
    window.addEventListener('quickCreate', handler);
    return () => window.removeEventListener('quickCreate', handler);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setFile(null);
    setPreview('');
    setFormOpen(true);
  };

  const handleOpenEdit = (brand: BrandData) => {
    setEditingId(brand._id);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description || '');
    setIsActive(brand.isActive);
    setFile(null);
    setPreview(brand.logo || '');
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    const payload = { name, slug, description, isActive };

    formData.append('data', JSON.stringify(payload));
    if (file) {
      formData.append('logo', file);
    }

    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setFormOpen(false);
      fetchBrands();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.delete(`/brands/${id}`);
      fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-black tracking-tight">Brands Moderator</h1>
          <p className="text-xs text-muted mt-1">Configure designer brands and label descriptions</p>
        </div>
        {user?.role !== 'EDITOR' && (
          <button onClick={handleOpenCreate} className="btn-primary text-xs">
            <Plus size={14} /> Add Brand
          </button>
        )}
      </div>

      {/* Grid of Brands */}
      <div className="grid md:grid-cols-4 gap-6">
        
        {loading ? (
          <div className="col-span-4 text-center text-xs text-muted py-8">
            <Loader2 className="animate-spin inline mr-2" size={16} /> Loading brands...
          </div>
        ) : brands.length === 0 ? (
          <div className="col-span-4 text-center text-xs text-muted py-8">No brands found.</div>
        ) : (
          brands.map((brand) => (
            <div key={brand._id} className="bg-card border border-border rounded-2xl p-5 shadow-premium flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden group">
              <div>
                {/* Logo Display */}
                <div className="h-24 w-full bg-muted/20 border border-border/50 rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                  {brand.logo ? (
                    <img src={brand.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image size={20} className="text-muted/30" />
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold ${
                    brand.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground">{brand.name}</h3>
                <p className="text-[10px] text-muted font-mono">slug: {brand.slug}</p>
                <p className="text-xs text-muted mt-2 line-clamp-2">{brand.description || 'No description provided.'}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border/50">
                <button onClick={() => handleOpenEdit(brand)} className="btn-secondary px-2.5 py-1.5 text-[10px]">
                  <Edit3 size={10} /> Edit
                </button>
                {user?.role === 'ADMIN' && (
                  <button onClick={() => handleDelete(brand._id)} className="btn-secondary px-2.5 py-1.5 text-[10px] text-red-500 hover:bg-red-500/10 hover:border-red-500/20">
                    <Trash2 size={10} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}

      </div>

      {/* ── Brand Form Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
              <h3 className="font-heading font-bold text-sm">{editingId ? 'Edit Brand' : 'Create Brand'}</h3>
              <button onClick={() => setFormOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="label-title">Brand Logo / Artwork</label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-20 bg-muted/20 border border-border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Image size={18} className="text-muted/30" />}
                  </div>
                  <input type="file" onChange={handleFileChange} className="text-[10px] text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>
              <div>
                <label className="label-title">Name</label>
                <input type="text" value={name} onChange={handleNameChange} className="input-field" required />
              </div>
              <div>
                <label className="label-title">Slug (auto-generated)</label>
                <input type="text" value={slug} disabled className="input-field bg-muted/10 opacity-70" />
              </div>
              <div>
                <label className="label-title">Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2 font-semibold">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                  <span>Is Brand Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

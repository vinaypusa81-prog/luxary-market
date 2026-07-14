import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import {
  Plus, Edit3, Trash2, Copy, Eye, Download, Upload,
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

interface ProductData {
  _id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
  images: string[];
  thumbnail: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
}

export const Products: React.FC = () => {
  const { api, user } = useAuth();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lists
  const [categories, setCategories] = useState<string[]>(['Men', 'Women', 'Accessories']);
  const [brands, setBrands] = useState<string[]>(['ForceStyle', 'Royal Weaves']);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Form Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState(0);
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK'>('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [shippingWeight, setShippingWeight] = useState(0.5);
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [warranty, setWarranty] = useState('1 Year');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // CSV Import State
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: selectedCategory,
        brand: selectedBrand,
        status: selectedStatus,
        sortBy,
        sortOrder,
        page,
        limit,
      };
      const { data } = await api.get('/products', { params });
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, selectedCategory, selectedBrand, selectedStatus, sortBy, sortOrder]);

  // Listen for Quick Create event dispatched from Layout topbar
  useEffect(() => {
    const handler = () => handleOpenCreate();
    window.addEventListener('quickCreate', handler);
    return () => window.removeEventListener('quickCreate', handler);
  }, [categories, brands]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchProducts();
    }
  };

  // Image Drag and Drop Handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const removePreviewImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((x) => x !== url));
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory(categories[0] || '');
    setBrand(brands[0] || '');
    setSku('');
    setPrice(0);
    setDiscountPrice(undefined);
    setQuantity(0);
    setStatus('ACTIVE');
    setIsFeatured(false);
    setIsTrending(false);
    setIsNewArrival(false);
    setIsBestSeller(false);
    setShippingWeight(0.5);
    setLength(0);
    setWidth(0);
    setHeight(0);
    setWarranty('1 Year');
    setTags([]);
    setColors([]);
    setSizes([]);
    setUploadedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = async (prod: ProductData) => {
    setEditingId(prod._id);
    setName(prod.name);
    setSku(prod.sku);
    setPrice(prod.price);
    setDiscountPrice(prod.discountPrice);
    setQuantity(prod.quantity);
    setStatus(prod.status);
    setIsFeatured(prod.isFeatured);
    setIsTrending(prod.isTrending);
    setIsNewArrival(prod.isNewArrival);
    setIsBestSeller(prod.isBestSeller);
    
    // Load full details from api
    try {
      const { data } = await api.get(`/products/${prod._id}`);
      setDescription(data.description);
      setCategory(data.category);
      setBrand(data.brand || '');
      setShippingWeight(data.shippingWeight || 0.5);
      setLength(data.dimensions?.length || 0);
      setWidth(data.dimensions?.width || 0);
      setHeight(data.dimensions?.height || 0);
      setWarranty(data.warranty || '1 Year');
      setTags(data.tags || []);
      setColors(data.color || []);
      setSizes(data.size || []);
      setExistingImages(data.images || []);
    } catch (e) {
      console.error(e);
    }
    
    setUploadedFiles([]);
    setImagePreviews([]);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    const payload = {
      name,
      description,
      category,
      brand,
      sku,
      price,
      discountPrice,
      quantity,
      status,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      shippingWeight,
      dimensions: { length, width, height },
      warranty,
      tags,
      color: colors,
      size: sizes,
      images: existingImages, // send down retained images
    };

    formData.append('data', JSON.stringify(payload));
    uploadedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/products/duplicate/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;
    try {
      await api.post('/products/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/products/bulk-update', { ids: selectedIds, updateData: { status: newStatus } });
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/products/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/products/import-csv', { csvText });
      setCsvOpen(false);
      setCsvText('');
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  // AI Description Stub generator
  const triggerAIDescription = () => {
    if (!name) return alert('Provide a product name first.');
    const generated = `Step into smart luxury with the all-new ${name}. Designed specifically for modern trends, this premium ${category} essential features absolute comfort, durable fabric, and tailored design. Perfect for smart-casual wear, evening coordinates, and styling headers.`;
    setDescription(generated);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page Header Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black tracking-tight">Catalog Management</h1>
          <p className="text-xs text-muted mt-1">Manage e-commerce products, inventories, and CSV operations</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExportCSV} className="btn-secondary text-xs">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setCsvOpen(true)} className="btn-secondary text-xs">
            <Upload size={14} /> Import CSV
          </button>
          {user?.role !== 'EDITOR' && (
            <button onClick={handleOpenCreate} className="btn-primary text-xs">
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-premium space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3.5 top-3 text-muted"><Search size={16} /></span>
            <input
              type="text"
              placeholder="Search product name or SKU (Hit Enter)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary w-full md:w-auto text-xs">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50 text-xs">
            <div>
              <label className="label-title">Filter by Category</label>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="input-field">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-title">Filter by Brand</label>
              <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }} className="input-field">
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label-title">Filter by Status</label>
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }} className="input-field">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between text-xs font-semibold animate-fade-in">
          <span>{selectedIds.length} items selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatusChange('ACTIVE')} className="text-primary hover:underline px-2">Activate</button>
            <button onClick={() => handleBulkStatusChange('INACTIVE')} className="text-muted hover:underline px-2">Deactivate</button>
            {user?.role === 'ADMIN' && (
              <button onClick={handleBulkDelete} className="text-red-500 hover:underline px-2 flex items-center gap-1">
                <Trash2 size={12} /> Bulk Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Products List View ── */}
      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5 text-xs font-bold text-muted uppercase">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={products.length > 0 && selectedIds.length === products.length} />
                </th>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Product Info</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">
                    <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">No products found.</td>
                </tr>
              ) : (
                products.map((p) => {
                  const isChecked = selectedIds.includes(p._id);
                  return (
                    <tr key={p._id} className={`hover:bg-muted/5 ${isChecked ? 'bg-primary/[0.02]' : ''}`}>
                      <td className="p-4 text-center">
                        <input type="checkbox" checked={isChecked} onChange={() => handleSelectOne(p._id)} />
                      </td>
                      <td className="p-4">
                        <div className="h-12 w-10 bg-muted/20 border border-border rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={p.thumbnail || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100&q=80'} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-muted capitalize">{p.category} · {p.brand}</p>
                      </td>
                      <td className="p-4 font-mono font-bold text-muted">{p.sku}</td>
                      <td className="p-4">
                        {p.discountPrice ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground">INR {p.discountPrice}</p>
                            <p className="text-[10px] text-muted line-through">INR {p.price}</p>
                          </div>
                        ) : (
                          <p className="font-bold text-foreground">INR {p.price}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${p.quantity === 0 ? 'text-red-500' : p.quantity <= 10 ? 'text-amber-500' : 'text-foreground'}`}>
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                          p.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-500' :
                          p.status === 'OUT_OF_STOCK' ? 'bg-red-500/10 text-red-500' : 'bg-muted/20 text-muted'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleDuplicate(p._id)} title="Duplicate Product" className="p-2 border border-border rounded-lg hover:bg-muted/10 text-muted transition-colors">
                            <Copy size={12} />
                          </button>
                          <button onClick={() => handleOpenEdit(p)} title="Edit Details" className="p-2 border border-border rounded-lg hover:bg-muted/10 text-muted transition-colors">
                            <Edit3 size={12} />
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button onClick={() => handleDelete(p._id)} title="Delete Item" className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex justify-between items-center p-4 border-t border-border text-xs font-semibold text-muted bg-muted/5">
          <span>Showing {products.length} of {totalCount} products</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1.5 border border-border rounded-lg disabled:opacity-50 hover:bg-muted/10 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 flex items-center">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-1.5 border border-border rounded-lg disabled:opacity-50 hover:bg-muted/10 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* ── 1. Create/Edit Product Form Modal ── */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl border border-border rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5 flex-shrink-0">
              <div>
                <h3 className="text-md font-heading font-bold">{editingId ? 'Edit Product Specifications' : 'Add New Product to Catalog'}</h3>
                <p className="text-[10px] text-muted">Complete details will write-through sync with the storefront database</p>
              </div>
              <button onClick={() => setFormOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto flex-grow text-xs">
              
              {/* Product Info Section */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Image Upload Dropzone */}
                <div className="md:col-span-1 space-y-4">
                  <label className="label-title">Product Image Assets</label>
                  <div {...getRootProps()} className={`border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                    <input {...getInputProps()} />
                    <Sparkles size={20} className="mx-auto text-primary mb-2 animate-pulse" />
                    <p className="font-bold text-[10px]">Drag & Drop Images</p>
                    <p className="text-[9px] text-muted mt-1">Accepts PNG, JPG, WEBP (Max 5MB)</p>
                  </div>

                  {/* Previews Layout */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Existing database images */}
                    {existingImages.map((url, i) => (
                      <div key={`exist-${i}`} className="relative h-16 rounded-xl border border-border overflow-hidden bg-muted group">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeExistingImage(url)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {/* Freshly uploaded previews */}
                    {imagePreviews.map((url, i) => (
                      <div key={`preview-${i}`} className="relative h-16 rounded-xl border border-border overflow-hidden bg-muted group">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removePreviewImage(i)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Data Fields */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-title">Product Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
                    </div>
                    <div>
                      <label className="label-title">Unique SKU</label>
                      <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="input-field" required />
                    </div>
                    <div>
                      <label className="label-title">Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-title">Brand</label>
                      <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field">
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-title">Base Price (INR)</label>
                      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input-field" required />
                    </div>
                    <div>
                      <label className="label-title">Discount Price (INR)</label>
                      <input type="number" value={discountPrice || ''} onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)} className="input-field" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="label-title">Inventory Quantity</label>
                      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input-field" required />
                    </div>
                    <div>
                      <label className="label-title">Listing Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input-field">
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & AI Block */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="label-title mb-0">Detailed Description</label>
                  <button type="button" onClick={triggerAIDescription} className="text-primary hover:text-primary-dark font-bold flex items-center gap-1">
                    <Sparkles size={12} /> AI Generate
                  </button>
                </div>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" required />
              </div>

              {/* Attribute Lists: Colors, Sizes, Tags */}
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Colors */}
                <div className="space-y-3">
                  <label className="label-title">Add Available Colors</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. Blue" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="input-field" />
                    <button type="button" onClick={addColor} className="btn-secondary py-1 text-xs">Add</button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.map((c) => (
                      <span key={c} className="px-2 py-1 bg-muted/10 border border-border rounded-lg flex items-center gap-1.5">
                        {c}
                        <button type="button" onClick={() => setColors(colors.filter(x => x !== c))} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <label className="label-title">Add Sizes</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. XL" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} className="input-field" />
                    <button type="button" onClick={addSize} className="btn-secondary py-1 text-xs">Add</button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {sizes.map((s) => (
                      <span key={s} className="px-2 py-1 bg-muted/10 border border-border rounded-lg flex items-center gap-1.5">
                        {s}
                        <button type="button" onClick={() => setSizes(sizes.filter(x => x !== s))} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="label-title">Tags / Keywords</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. polo" value={tagInput} onChange={(e) => setTagInput(e.target.value)} className="input-field" />
                    <button type="button" onClick={addTag} className="btn-secondary py-1 text-xs">Add</button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {tags.map((t) => (
                      <span key={t} className="px-2 py-1 bg-muted/10 border border-border rounded-lg flex items-center gap-1.5">
                        {t}
                        <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Shipping & Specs Section */}
              <div className="border-t border-border pt-6 grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="label-title">Shipping Weight (kg)</label>
                  <input type="number" step="0.01" value={shippingWeight} onChange={(e) => setShippingWeight(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="label-title">Dimensions (L × W × H in cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" placeholder="L" value={length || ''} onChange={(e) => setLength(Number(e.target.value))} className="input-field text-center" />
                    <input type="number" placeholder="W" value={width || ''} onChange={(e) => setWidth(Number(e.target.value))} className="input-field text-center" />
                    <input type="number" placeholder="H" value={height || ''} onChange={(e) => setHeight(Number(e.target.value))} className="input-field text-center" />
                  </div>
                </div>
                <div>
                  <label className="label-title">Warranty Coverage</label>
                  <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="input-field" />
                </div>
              </div>

              {/* Toggles Checklist */}
              <div className="flex gap-6 flex-wrap font-bold pt-4 border-t border-border/50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded" />
                  <span>Trending Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="rounded" />
                  <span>New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="rounded" />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Specifications'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── 2. CSV Import Modal ── */}
      {csvOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
              <div>
                <h3 className="font-heading font-bold text-sm">Bulk Import Products</h3>
                <p className="text-[10px] text-muted">Paste CSV text rows below to upload to database</p>
              </div>
              <button onClick={() => setCsvOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>
            <form onSubmit={handleImportCSV} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Required CSV Headers:</p>
                  <p className="text-[10px] mt-0.5">SKU, Name, Category, Price, Quantity (Optional). Ensure commas separate cells, one row per line.</p>
                </div>
              </div>
              <div>
                <label className="label-title">CSV Raw Text</label>
                <textarea
                  rows={8}
                  placeholder="SKU,Name,Category,Price,Quantity&#10;SHIRT-001,Premium Cotton Shirt,Men,1599,20&#10;DRESS-002,Summer Silk Dress,Women,3999,15"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="input-field font-mono text-[10px] leading-relaxed"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setCsvOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={importing} className="btn-primary">
                  {importing ? <Loader2 size={16} className="animate-spin" /> : 'Import Items'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Eye, ShieldAlert, ShieldCheck, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, ShoppingBag, MapPin, Gift
} from 'lucide-react';

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'BLOCKED';
  addresses: Address[];
  wishlist: string[];
  totalSpending: number;
  orderCount: number;
  createdAt: string;
}

export const Customers: React.FC = () => {
  const { api, user } = useAuth();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals / Details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { search, status, page, limit };
      const { data } = await api.get('/customers', { params });
      setCustomers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, status]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchCustomers();
    }
  };

  const handleOpenDetails = async (cust: CustomerData) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const { data } = await api.get(`/customers/${cust._id}`);
      setSelectedCustomer(data.customer);
      setCustomerOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to set customer profile state to ${nextStatus.toLowerCase()}?`)) return;

    try {
      const { data } = await api.put(`/customers/${id}/toggle-block`, { status: nextStatus });
      // Update selected profile view if open
      if (selectedCustomer && selectedCustomer._id === id) {
        setSelectedCustomer(data.customer);
      }
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer account?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setDetailsOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-black tracking-tight">Customer Database</h1>
        <p className="text-xs text-muted mt-1">Review user accounts, addresses, wishlist counts, and totals spent</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-3.5 top-3 text-muted"><Search size={16} /></span>
          <input
            type="text"
            placeholder="Search name, email, or phone (Hit Enter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="input-field pl-10"
          />
        </div>
        <div className="w-full md:w-auto text-xs">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Accounts</option>
            <option value="ACTIVE">Active Profiles</option>
            <option value="BLOCKED">Blocked Profiles</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5 text-xs font-bold text-muted uppercase">
                <th className="p-4">Customer Info</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Purchased Count</th>
                <th className="p-4">Total Spending</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/5">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted">{c.email}</p>
                    </td>
                    <td className="p-4 text-muted font-mono">{c.phone || 'N/A'}</td>
                    <td className="p-4 text-center font-semibold">{c.orderCount} orders</td>
                    <td className="p-4 font-bold text-foreground">{formatCurrency(c.totalSpending)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        c.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleOpenDetails(c)} className="p-2 border border-border rounded-lg hover:bg-muted/10 text-muted transition-colors">
                          <Eye size={12} />
                        </button>
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleToggleBlock(c._id, c.status)} className={`p-2 border border-border rounded-lg transition-colors ${
                            c.status === 'ACTIVE' ? 'hover:bg-amber-500/10 text-amber-500' : 'hover:bg-green-500/10 text-green-500'
                          }`}>
                            {c.status === 'ACTIVE' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
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

        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-4 border-t border-border text-xs font-semibold text-muted bg-muted/5">
          <span>Showing {customers.length} of {totalCount} profiles</span>
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

      {/* ── Customer Details Modal ── */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl border border-border rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5 flex-shrink-0">
              <div>
                <h3 className="text-md font-heading font-bold">Customer Account Overview</h3>
                <p className="text-[10px] text-muted">Addresses, active shopping wishlists, and billing timeline history</p>
              </div>
              <button onClick={() => setDetailsOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>

            {/* Body */}
            {detailsLoading || !selectedCustomer ? (
              <div className="p-12 text-center text-xs text-muted">
                <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading profile records...
              </div>
            ) : (
              <div className="p-6 overflow-y-auto flex-grow grid md:grid-cols-3 gap-8 text-xs">
                
                {/* Left Column: Contact details, wishlists, address books */}
                <div className="md:col-span-1 space-y-6">
                  
                  {/* Account detail card */}
                  <div className="space-y-3 bg-muted/10 border border-border p-4 rounded-2xl relative">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-primary">Profile Info</h4>
                    <p className="text-sm font-bold">{selectedCustomer.name}</p>
                    <p className="text-muted leading-relaxed font-mono">
                      Email: {selectedCustomer.email}<br />
                      Phone: {selectedCustomer.phone || 'N/A'}
                    </p>
                    <p className="text-muted">Total Spending: <span className="font-bold text-foreground">{formatCurrency(selectedCustomer.totalSpending)}</span></p>
                    <p className="text-muted">Orders Count: <span className="font-bold text-foreground">{selectedCustomer.orderCount} purchases</span></p>

                    <div className="pt-2 flex gap-2">
                      <button onClick={() => handleToggleBlock(selectedCustomer._id, selectedCustomer.status)} className="btn-secondary flex-grow text-[10px] py-2">
                        {selectedCustomer.status === 'ACTIVE' ? 'Block Account' : 'Unblock Account'}
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(selectedCustomer._id)} className="btn-secondary text-[10px] text-red-500 py-2 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Wishlist item slugs */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-muted flex items-center gap-1.5">
                      <Gift size={14} className="text-primary" /> Active Wishlist
                    </h4>
                    {selectedCustomer.wishlist.length === 0 ? (
                      <p className="text-muted italic">Wishlist is empty.</p>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedCustomer.wishlist.map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-muted/10 border border-border rounded-lg text-[10px] font-semibold text-muted font-mono">{item}</span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Address Books, Order History Log */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Address List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm border-b border-border pb-1.5 flex items-center gap-1.5">
                      <MapPin size={16} className="text-primary" /> Saved Addresses
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedCustomer.addresses.length === 0 ? (
                        <p className="text-muted italic col-span-2">No saved addresses.</p>
                      ) : (
                        selectedCustomer.addresses.map((addr, idx) => (
                          <div key={idx} className={`p-4 border rounded-xl relative ${addr.isDefault ? 'border-primary bg-primary/[0.01]' : 'border-border'}`}>
                            {addr.isDefault && <span className="absolute top-3 right-3 bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full">Default</span>}
                            <p className="font-bold">{addr.fullName}</p>
                            <p className="text-muted leading-relaxed mt-1">
                              {addr.line1}, {addr.line2 || ''}<br />
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-muted mt-1">Phone: {addr.phone}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm border-b border-border pb-1.5 flex items-center gap-1.5">
                      <ShoppingBag size={16} className="text-primary" /> Purchase History
                    </h4>
                    <div className="space-y-2">
                      {customerOrders.length === 0 ? (
                        <p className="text-muted italic">No purchases recorded.</p>
                      ) : (
                        customerOrders.map((order) => (
                          <div key={order._id} className="border border-border/50 p-4 rounded-2xl flex justify-between items-center bg-muted/5">
                            <div>
                              <p className="font-bold text-foreground">Order ID: {order.orderId}</p>
                              <p className="text-[10px] text-muted">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-muted mt-1">{order.products.map((p: any) => `${p.name} (x${p.quantity})`).join(', ')}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-bold text-foreground">{formatCurrency(order.total)}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                                order.orderStatus === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                                order.orderStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                              }`}>{order.orderStatus}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

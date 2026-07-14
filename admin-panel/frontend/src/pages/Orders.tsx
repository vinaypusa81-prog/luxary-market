import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search, Eye, FileText, Mail, Truck, Calendar, Clock,
  ChevronLeft, ChevronRight, X, Loader2, ArrowUpRight, CheckCircle2, AlertCircle
} from 'lucide-react';

interface OrderItem {
  name: string;
  sku: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface OrderTimeline {
  status: string;
  title: string;
  description: string;
  timestamp: string;
}

interface OrderData {
  _id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  products: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  deliveryPartner?: string;
  estimatedDelivery?: string;
  timeline: OrderTimeline[];
  createdAt: string;
}

export const Orders: React.FC = () => {
  const { api, user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals / Details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [shipOpen, setShipOpen] = useState(false);
  
  // Ship form
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { search, orderStatus, paymentStatus, page, limit };
      const { data } = await api.get('/orders', { params });
      setOrders(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit, orderStatus, paymentStatus]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchOrders();
    }
  };

  const handleOpenDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      // Update selected order details view if open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);

    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/ship`, {
        trackingNumber,
        deliveryPartner,
        estimatedDelivery
      });
      setSelectedOrder(data.order);
      setShipOpen(false);
      setTrackingNumber('');
      setDeliveryPartner('');
      setEstimatedDelivery('');
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (id: string, orderId: string) => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Invoice download failed:', err);
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      const { data } = await api.post(`/orders/${id}/email`);
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-black tracking-tight">Order Management</h1>
        <p className="text-xs text-muted mt-1">Track purchases, shipments, timelines, and invoice PDF prints</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-premium flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-3.5 top-3 text-muted"><Search size={16} /></span>
          <input
            type="text"
            placeholder="Search order ID or customer name (Hit Enter)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="input-field pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto text-xs">
          <select value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5 text-xs font-bold text-muted uppercase">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Placed</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">
                    <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading order entries...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted/5">
                    <td className="p-4 font-mono font-bold text-primary flex items-center gap-1.5">
                      {order.orderId}
                      <ArrowUpRight size={12} className="text-muted/60" />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-foreground">{order.customerName}</p>
                      <p className="text-[10px] text-muted">{order.email}</p>
                    </td>
                    <td className="p-4 text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center font-semibold">{order.products.reduce((a, c) => a + c.quantity, 0)} items</td>
                    <td className="p-4 font-bold text-foreground">INR {order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.paymentStatus === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                        order.paymentStatus === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                        order.paymentStatus === 'REFUNDED' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.orderStatus === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                        order.orderStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                        order.orderStatus === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleOpenDetails(order)} className="p-2 border border-border rounded-lg hover:bg-muted/10 text-muted transition-colors">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => handleDownloadInvoice(order._id, order.orderId)} className="p-2 border border-border rounded-lg hover:bg-primary/10 hover:text-primary text-muted transition-colors">
                          <FileText size={12} />
                        </button>
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
          <span>Showing {orders.length} of {totalCount} orders</span>
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

      {/* ── Order Details Overlay Modal ── */}
      {detailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl border border-border rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-md font-heading font-bold">Order Details: {selectedOrder.orderId}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedOrder.orderStatus === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                    selectedOrder.orderStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <p className="text-[10px] text-muted mt-0.5">Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setDetailsOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow grid md:grid-cols-3 gap-8 text-xs">
              
              {/* Left Column: Items, Address, Pricing */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm border-b border-border pb-1.5">Line Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.products.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border border-border/50 p-3 rounded-xl bg-muted/5">
                        <div>
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted font-mono">SKU: {item.sku} · Qty: {item.quantity} {item.size ? `· Size: ${item.size}` : ''} {item.color ? `· Color: ${item.color}` : ''}</p>
                        </div>
                        <p className="font-bold text-foreground">INR {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address & payment */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm border-b border-border pb-1.5">Shipment Address</h4>
                    <p className="font-bold">{selectedOrder.shippingAddress?.fullName || selectedOrder.customerName}</p>
                    <p className="text-muted leading-relaxed">
                      {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.line2 || ''}<br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </p>
                    <p className="text-muted">Phone: {selectedOrder.shippingAddress?.phone || selectedOrder.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm border-b border-border pb-1.5">Billing & Payment</h4>
                    <p className="text-muted">Method: <span className="font-bold text-foreground">{selectedOrder.paymentMethod}</span></p>
                    <p className="text-muted">Status: <span className="font-bold text-foreground">{selectedOrder.paymentStatus}</span></p>
                    
                    {/* Display tracking details if shipped */}
                    {selectedOrder.trackingNumber && (
                      <div className="mt-3 bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                        <p className="font-bold text-[10px] text-blue-600 uppercase tracking-wide flex items-center gap-1.5">
                          <Truck size={12} /> Shipment Dispatched
                        </p>
                        <p className="text-muted mt-1">Carrier: {selectedOrder.deliveryPartner}</p>
                        <p className="text-muted font-mono">Tracking: {selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtotals breakdown */}
                <div className="space-y-2 border-t border-border pt-4 max-w-sm ml-auto">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>INR {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>GST (18% Tax)</span>
                    <span>INR {selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Collected</span>
                      <span>- INR {selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>Shipping Fee</span>
                    <span>INR {selectedOrder.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
                    <span>Grand Total</span>
                    <span>INR {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Status Operations, Timeline */}
              <div className="space-y-6 border-l border-border/50 pl-6">
                
                {/* Fulfillment panel */}
                {user?.role !== 'EDITOR' && (
                  <div className="space-y-3 bg-muted/10 border border-border p-4 rounded-2xl">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-primary">Process Order</h4>
                    <div>
                      <label className="label-title">Fulfillment Status</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        disabled={updating}
                        className="input-field text-[11px]"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>

                    {selectedOrder.orderStatus === 'PACKED' && (
                      <button onClick={() => setShipOpen(true)} className="btn-primary w-full text-[10px] py-2 mt-2">
                        <Truck size={12} /> Dispatch Shipment
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button onClick={() => handleDownloadInvoice(selectedOrder._id, selectedOrder.orderId)} className="btn-secondary py-2 text-[10px]">
                        Print Invoice
                      </button>
                      <button onClick={() => handleSendEmail(selectedOrder._id)} className="btn-secondary py-2 text-[10px]">
                        Email Invoice
                      </button>
                    </div>
                  </div>
                )}

                {/* Chronological Timeline Tracker */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-muted">Tracking Timeline</h4>
                  <div className="relative border-l border-border pl-4 space-y-4">
                    {selectedOrder.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline circle indicator */}
                        <span className="absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <p className="font-bold text-foreground leading-none">{step.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">{step.description}</p>
                        <p className="text-[9px] text-primary/70 mt-1 flex items-center gap-1 font-semibold">
                          <Clock size={10} /> {new Date(step.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Shipment Details Form overlay ── */}
      {shipOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
              <h3 className="font-heading font-bold text-sm">Fulfill & Dispatch Order</h3>
              <button onClick={() => setShipOpen(false)} className="p-1.5 border border-border rounded-xl hover:bg-muted/10"><X size={16} /></button>
            </div>
            <form onSubmit={handleShipSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="label-title">Delivery Partner / Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart, DHL, Delhivery"
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-title">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="AWB tracking digits"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-title">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShipOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Fulfill Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

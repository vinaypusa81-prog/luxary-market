import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, Check, X, Trash2, CornerDownRight, Star, Loader2,
  ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react';

interface ReviewData {
  _id: string;
  productName: string;
  customerName: string;
  rating: number;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reply?: string;
  createdAt: string;
}

export const Reviews: React.FC = () => {
  const { api, user } = useAuth();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inline Reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = { status, page, limit };
      const { data } = await api.get('/reviews', { params });
      setReviews(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, limit, status]);

  const handleModerate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/reviews/${id}/moderate`, { status: newStatus });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      await api.post(`/reviews/${id}/reply`, { reply: replyText });
      setReplyingId(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-black tracking-tight">Reviews Moderation</h1>
        <p className="text-xs text-muted mt-1">Review ratings, verify feedback, and post admin replies</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-premium flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">Filter list:</span>
        <div className="text-xs">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field py-2">
            <option value="">All Feedback</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="APPROVED">Approved Reviews</option>
            <option value="REJECTED">Rejected Reviews</option>
          </select>
        </div>
      </div>

      {/* Reviews Table List */}
      <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5 text-xs font-bold text-muted uppercase">
                <th className="p-4">Customer Details</th>
                <th className="p-4">Product Reviewed</th>
                <th className="p-4">Rating</th>
                <th className="p-4 w-96">Feedback Context</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    <Loader2 className="animate-spin inline mr-2 text-primary" size={16} /> Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/5 align-top">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{r.customerName}</p>
                      <p className="text-[10px] text-muted">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 font-bold text-foreground">{r.productName}</td>
                    <td className="p-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 space-y-2">
                      <p className="text-foreground leading-relaxed italic">"{r.body}"</p>
                      
                      {/* Admin Reply log if present */}
                      {r.reply ? (
                        <div className="flex gap-2 items-start pl-3 py-2 border-l-2 border-primary bg-primary/5 rounded-r-xl">
                          <CornerDownRight size={12} className="text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-[10px] text-primary">Admin Response:</p>
                            <p className="text-muted leading-relaxed mt-0.5">"{r.reply}"</p>
                          </div>
                        </div>
                      ) : (
                        replyingId === r._id ? (
                          <form onSubmit={(e) => handleReplySubmit(e, r._id)} className="space-y-2 max-w-md pt-2">
                            <textarea
                              rows={2}
                              placeholder="Type response reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="input-field text-[11px]"
                              required
                            />
                            <div className="flex gap-2">
                              <button type="submit" disabled={submittingReply} className="btn-primary py-1 px-3 text-[10px]">
                                {submittingReply ? <Loader2 size={10} className="animate-spin" /> : 'Submit Response'}
                              </button>
                              <button type="button" onClick={() => setReplyingId(null)} className="btn-secondary py-1 px-3 text-[10px]">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          user?.role !== 'EDITOR' && (
                            <button onClick={() => { setReplyingId(r._id); setReplyText(''); }} className="text-primary font-bold hover:underline text-[10px] flex items-center gap-1">
                              <MessageSquare size={10} /> Reply to customer
                            </button>
                          )
                        )
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        r.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                        r.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>{r.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {r.status === 'PENDING' && user?.role === 'ADMIN' && (
                          <>
                            <button onClick={() => handleModerate(r._id, 'APPROVED')} title="Approve Review" className="p-2 border border-border rounded-lg hover:bg-green-500/10 hover:text-green-600 text-muted transition-colors">
                              <Check size={12} />
                            </button>
                            <button onClick={() => handleModerate(r._id, 'REJECTED')} title="Reject Review" className="p-2 border border-border rounded-lg hover:bg-amber-500/10 hover:text-amber-600 text-muted transition-colors">
                              <X size={12} />
                            </button>
                          </>
                        )}
                        {user?.role === 'ADMIN' && (
                          <button onClick={() => handleDelete(r._id)} title="Delete Review" className="p-2 border border-border rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
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

        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-4 border-t border-border text-xs font-semibold text-muted bg-muted/5">
          <span>Showing {reviews.length} of {totalCount} reviews</span>
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

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, ShoppingBag, ShoppingCart, Users, DollarSign,
  PackageCheck, AlertTriangle, CalendarRange, Clock, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  desc?: string;
  trend?: string;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, desc, trend, colorClass }) => (
  <div className="bg-card border border-border p-6 rounded-2xl shadow-premium hover:shadow-lg transition-all flex justify-between items-start">
    <div className="space-y-2">
      <span className="text-xs font-bold text-muted uppercase tracking-wider">{title}</span>
      <h3 className="text-2xl font-heading font-black tracking-tight">{value}</h3>
      {trend && (
        <span className="text-[10px] bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
      {desc && <p className="text-[10px] text-muted">{desc}</p>}
    </div>
    <div className={`p-3.5 rounded-2xl ${colorClass} flex items-center justify-center flex-shrink-0 shadow-md`}>
      <Icon size={18} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const { data: stats } = await api.get('/dashboard/stats');
      setData(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/10 border border-border/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { cards, charts } = data || { cards: {}, charts: {} };
  
  // Format price
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const COLORS = ['#8b0000', '#f97316', '#2563eb', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-black tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-muted mt-1">Real-time metrics, order queues, and inventory analytics</p>
        </div>
      </div>

      {/* ── Dashboard Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(cards.totalRevenue)} icon={DollarSign} colorClass="bg-emerald-600" trend="+12.4% MoM" />
        <MetricCard title="Monthly Sales" value={formatCurrency(cards.monthlySales)} icon={CalendarRange} colorClass="bg-blue-600" desc="Sum of current month sales" />
        <MetricCard title="Total Orders" value={cards.totalOrders} icon={ShoppingCart} colorClass="bg-primary" trend="+5.2% Today" />
        <MetricCard title="Pending Orders" value={cards.pendingOrders} icon={Clock} colorClass="bg-amber-600" desc="Awaiting admin fulfillment" />
        <MetricCard title="Delivered Orders" value={cards.deliveredOrders} icon={PackageCheck} colorClass="bg-indigo-600" desc="Completed shipments" />
        <MetricCard title="Total Products" value={cards.totalProducts} icon={ShoppingBag} colorClass="bg-slate-700" />
        <MetricCard title="Active Products" value={cards.activeProducts} icon={ShoppingBag} colorClass="bg-green-600" desc="Live listings on storefront" />
        <MetricCard title="Out of Stock" value={cards.outOfStock} icon={AlertTriangle} colorClass="bg-red-600" desc="Low/zero inventory alerts" />
        <MetricCard title="Total Customers" value={cards.totalCustomers} icon={Users} colorClass="bg-violet-600" trend="+8 new users" />
        <MetricCard title="Today's Orders" value={cards.todayOrders} icon={ShoppingCart} colorClass="bg-accent" desc="Orders placed in past 24h" />
      </div>

      {/* ── Main Charts Grid ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Sales & Revenue Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-premium space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-heading font-bold text-sm">Revenue & Sales Performance</h3>
              <p className="text-[10px] text-muted mt-0.5">Sales volume vs total earnings for {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b0000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b0000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip formatter={(value: any) => [`INR ${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8b0000" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (Pie Chart) */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm">Category Share</h3>
            <p className="text-[10px] text-muted mt-0.5">Product distribution across departments</p>
          </div>
          <div className="h-60 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── Secondary Charts & Products ── */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-premium space-y-4">
          <div>
            <h3 className="font-heading font-bold text-sm">Top Selling Products</h3>
            <p className="text-[10px] text-muted mt-0.5">Leaderboard by unit sales volume</p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topSellingProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted)" tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend Line */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-premium flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm">Order Performance</h3>
            <p className="text-[10px] text-muted mt-0.5">Sales count patterns</p>
          </div>
          <div className="h-56 w-full text-xs mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} fill="#2563eb" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
export { TrendingUp, ShoppingBag, ShoppingCart, Users, DollarSign, PackageCheck, AlertTriangle, CalendarRange, Clock, ArrowUpRight };

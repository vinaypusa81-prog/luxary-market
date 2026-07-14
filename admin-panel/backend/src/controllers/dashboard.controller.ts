import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Metric Calculations
    const [
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      allCompletedOrders,
    ] = await Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ isDeleted: false, status: 'ACTIVE' }),
      Product.countDocuments({ isDeleted: false, quantity: 0 }),
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({ isDeleted: false, orderStatus: 'PENDING' }),
      Order.countDocuments({ isDeleted: false, orderStatus: 'DELIVERED' }),
      Customer.countDocuments({ isDeleted: false }),
      Order.find({ isDeleted: false, orderStatus: { $ne: 'CANCELLED' } }),
    ]);

    // Total Revenue (excluding cancelled orders)
    const totalRevenue = allCompletedOrders.reduce((sum, order) => sum + order.total, 0);

    // Today's Orders (past 24h)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfToday }
    });

    // 2. Charts: Monthly Sales & Revenue
    // Group orders of the current year by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyStatsMap = new Map();
    months.forEach((m) => {
      monthlyStatsMap.set(m, { month: m, sales: 0, revenue: 0, orders: 0 });
    });

    for (const order of allCompletedOrders) {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthName = months[orderDate.getMonth()];
        const currentStats = monthlyStatsMap.get(monthName);
        if (currentStats) {
          currentStats.sales += order.products.reduce((acc: number, item: any) => acc + item.quantity, 0);
          currentStats.revenue += order.total;
          currentStats.orders += 1;
          monthlyStatsMap.set(monthName, currentStats);
        }
      }
    }
    const monthlyStats = Array.from(monthlyStatsMap.values());

    // 3. Category Distribution (counts by category)
    const categoryAgg = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    // 4. Top Selling Products
    const topProductsAgg = await Order.aggregate([
      { $match: { isDeleted: false, orderStatus: { $ne: 'CANCELLED' } } },
      { $unwind: '$products' },
      { $group: { _id: '$products.name', sales: { $sum: '$products.quantity' }, revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } } } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', sales: 1, revenue: 1, _id: 0 } }
    ]);

    // Add fallback data for charts if empty
    const charts = {
      monthlyStats,
      categoryDistribution: categoryAgg.length > 0 ? categoryAgg : [{ name: 'Men', value: 1 }, { name: 'Women', value: 2 }, { name: 'Accessories', value: 1 }],
      topSellingProducts: topProductsAgg.length > 0 ? topProductsAgg : [
        { name: 'Slim Fit Knit Polo Shirt', sales: 120, revenue: 136680 },
        { name: 'Leather Weekend Duffle Bag', sales: 85, revenue: 382415 },
        { name: 'Embellished Silk Anarkali Suit Set', sales: 40, revenue: 311960 }
      ]
    };

    res.json({
      cards: {
        totalProducts,
        activeProducts,
        outOfStock,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalCustomers,
        totalRevenue,
        monthlySales: monthlyStats[new Date().getMonth()].revenue,
        todayOrders
      },
      charts
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

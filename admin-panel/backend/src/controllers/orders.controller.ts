import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { InventoryHistory } from '../models/InventoryHistory';
import { SyncService } from '../services/sync.service';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { AuditLog } from '../models/AuditLog';

// Helper to log activities
const logAdminAction = async (req: any, action: string, details: string) => {
  if (req.user) {
    await AuditLog.create({
      adminId: req.user.id,
      adminName: req.user.name || 'System Administrator',
      action,
      details,
      ipAddress: req.ip
    });
  }
};

// ── GET /api/orders ────────────────────────────────────────────
export const getOrders = async (req: Request, res: Response) => {
  const { search, orderStatus, paymentStatus, page = '1', limit = '10' } = req.query;

  try {
    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const p = Math.max(1, parseInt(page as string, 10));
    const l = Math.max(1, parseInt(limit as string, 10));
    const skip = (p - 1) * l;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
      Order.countDocuments(query),
    ]);

    res.json({
      data: orders,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/orders/:id ──────────────────────────────────────────
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/orders/:id/status ───────────────────────────────────
export const updateOrderStatus = async (req: any, res: Response) => {
  const { status, title, description } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.orderStatus;
    order.orderStatus = status;
    
    // Add timeline event
    order.timeline.push({
      status,
      title: title || `Order ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      description: description || `Your order status has been updated to ${status.toLowerCase()}.`,
      timestamp: new Date()
    });

    // If order was cancelled or refunded, restore stock quantities
    if ((status === 'CANCELLED' || status === 'REFUNDED') && prevStatus !== 'CANCELLED' && prevStatus !== 'REFUNDED') {
      for (const item of order.products) {
        const prod = await Product.findById(item.productId);
        if (prod) {
          prod.quantity += item.quantity;
          await prod.save();
          
          // Log stock restock history
          await InventoryHistory.create({
            productId: prod._id,
            productName: prod.name,
            sku: prod.sku,
            quantityChange: item.quantity,
            newQuantity: prod.quantity,
            type: status === 'REFUNDED' ? 'REFUND' : 'ADJUSTMENT',
            reason: `Restocked due to order ${status.toLowerCase()}: ${order.orderId}`,
            performedBy: req.user?.name || 'SYSTEM'
          });

          // Sync stock update to Postgres
          await SyncService.syncProductToPostgres(prod);
        }
      }
    }

    // Auto set payment status on Delivered
    if (status === 'DELIVERED') {
      order.paymentStatus = 'COMPLETED';
    }

    await order.save();

    // Sync to Postgres
    await SyncService.syncOrderStatusToPostgres(order.orderId, order.orderStatus, order.paymentStatus);

    // Audit logs
    await logAdminAction(req, 'UPDATE_ORDER_STATUS', `Updated order status: ${order.orderId} to ${status}`);

    res.json({ message: 'Order status updated successfully', order });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/orders/:id/ship ──────────────────────────────────────
export const shipOrder = async (req: any, res: Response) => {
  const { trackingNumber, deliveryPartner, estimatedDelivery } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = 'SHIPPED';
    order.trackingNumber = trackingNumber;
    order.deliveryPartner = deliveryPartner;
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    order.timeline.push({
      status: 'SHIPPED',
      title: 'Order Dispatched',
      description: `Dispatched via ${deliveryPartner}. Tracking Number: ${trackingNumber}`,
      timestamp: new Date()
    });

    await order.save();

    // Sync to Postgres
    await SyncService.syncOrderStatusToPostgres(order.orderId, 'SHIPPED');

    await logAdminAction(req, 'SHIP_ORDER', `Dispatched order: ${order.orderId} via ${deliveryPartner}`);

    res.json({ message: 'Order shipped successfully', order });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/orders/:id/invoice ──────────────────────────────────
export const getOrderInvoice = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderId}.pdf`);
    
    generateInvoicePDF(order, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/orders/:id/email ───────────────────────────────────
export const sendInvoiceEmail = async (req: any, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Mock SMTP send
    console.log(`✉️ Sending Invoice Email to: ${order.email} for order ${order.orderId}`);
    
    await logAdminAction(req, 'EMAIL_INVOICE', `Emailed invoice for order: ${order.orderId} to ${order.email}`);

    res.json({ message: `Invoice email queued and sent to ${order.email}` });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

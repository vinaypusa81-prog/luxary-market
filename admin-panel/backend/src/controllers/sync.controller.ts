import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';
import { prisma } from '../config/prisma';
import { getIO } from '../server'; // Socket instance to broadcast updates

const SYNC_SECRET = process.env.STORE_SYNC_SECRET || 'your-store-sync-webhook-secret-change-in-production';

export const syncWebhook = async (req: Request, res: Response) => {
  const secretHeader = req.headers['x-sync-secret'];
  if (secretHeader !== SYNC_SECRET) {
    return res.status(401).json({ message: 'Unauthorized sync secret key' });
  }

  const { model, action, data } = req.body;
  console.log(`📡 Webhook sync received: Model=${model}, Action=${action}, ID=${data?.id}`);

  try {
    const io = getIO();

    if (model === 'User') {
      if (data.role === 'CUSTOMER') {
        const query = { postgresId: data.id };
        const update = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.isBanned ? 'BLOCKED' : 'ACTIVE',
        };

        const customer = await Customer.findOneAndUpdate(query, update, { upsert: true, new: true });
        
        if (action === 'create') {
          // Send notification
          const notif = await Notification.create({
            title: 'New Customer Registered',
            message: `${customer.name} (${customer.email}) signed up on the storefront.`,
            type: 'NEW_CUSTOMER',
            metadata: { customerId: customer._id }
          });
          io.emit('notification', notif);
        }
      }
    } 
    
    else if (model === 'Review') {
      const dbProduct = await Product.findOne({ postgresId: data.productId });
      
      const query = { postgresId: data.id };
      const update = {
        productId: dbProduct ? dbProduct._id.toString() : 'temp_id',
        postgresProductId: data.productId,
        productName: dbProduct ? dbProduct.name : 'Unknown Product',
        customerName: data.customerName || 'Storefront Customer',
        rating: data.rating,
        body: data.body,
        status: data.status, // PENDING, APPROVED, REJECTED
      };

      const review = await Review.findOneAndUpdate(query, update, { upsert: true, new: true });

      if (action === 'create') {
        const notif = await Notification.create({
          title: 'New Product Review',
          message: `${review.customerName} reviewed "${review.productName}" with ${review.rating} stars.`,
          type: 'SYSTEM',
          metadata: { reviewId: review._id }
        });
        io.emit('notification', notif);
      }
    } 
    
    else if (model === 'Order') {
      // Find customer
      let customer = await Customer.findOne({ postgresId: data.userId });
      if (!customer && data.userId) {
        // Fetch user from Postgres via prisma to create customer row if missing
        const pgUser = await prisma?.user.findUnique({ where: { id: data.userId } }).catch(() => null);
        if (pgUser) {
          customer = await Customer.create({
            name: pgUser.name,
            email: pgUser.email,
            phone: pgUser.phone,
            postgresId: pgUser.id,
            status: 'ACTIVE'
          });
        }
      }

      // Map line items
      const productsMapped = [];
      if (data.orderItems && Array.isArray(data.orderItems)) {
        for (const item of data.orderItems) {
          const dbProd = await Product.findOne({ postgresId: item.productId });
          productsMapped.push({
            productId: dbProd ? dbProd._id.toString() : 'temp-prod-id',
            postgresProductId: item.productId,
            name: item.productName || 'Product',
            sku: item.productSku || 'SKU',
            price: item.price,
            quantity: item.quantity,
            thumbnail: dbProd?.thumbnail || ''
          });

          // Adjust local Mongoose inventory stock
          if (action === 'create' && dbProd) {
            dbProd.quantity = Math.max(0, dbProd.quantity - item.quantity);
            await dbProd.save();

            // Low Stock trigger check
            if (dbProd.quantity <= 10) {
              const lowStockNotif = await Notification.create({
                title: 'Low Stock Alert',
                message: `Product SKU "${dbProd.sku}" has low stock remaining: ${dbProd.quantity} units.`,
                type: 'LOW_STOCK',
                metadata: { sku: dbProd.sku, qty: dbProd.quantity }
              });
              io.emit('notification', lowStockNotif);
            }
          }
        }
      }

      const query = { postgresId: data.id };
      
      // Timeline mappings
      let timeline: any[] = [];
      if (action === 'create') {
        timeline = [{ status: 'PENDING', title: 'Order Placed', description: 'Thank you for shopping! We have received your order.' }];
      }

      const update = {
        orderId: data.orderNumber,
        customerName: customer ? customer.name : (data.shippingAddress?.fullName || 'Customer'),
        email: customer ? customer.email : 'customer@example.com',
        phone: customer ? (customer.phone || '') : (data.shippingAddress?.phone || ''),
        customerId: customer ? customer._id.toString() : undefined,
        products: productsMapped,
        subtotal: data.subtotal,
        shipping: data.shippingFee || 0,
        tax: data.taxFee || 0,
        discount: data.discountFee || 0,
        total: data.totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        orderStatus: data.orderStatus,
        shippingAddress: data.shippingAddress,
        ...(action === 'create' ? { timeline } : {})
      };

      const order = await Order.findOneAndUpdate(query, update, { upsert: true, new: true });

      // Update customer stats
      if (customer && action === 'create') {
        customer.totalSpending += order.total;
        customer.orderCount += 1;
        await customer.save();
      }

      if (action === 'create') {
        const notif = await Notification.create({
          title: 'New Order Placed',
          message: `Order #${order.orderId} placed by ${order.customerName} for a total of INR ${order.total.toFixed(2)}.`,
          type: 'NEW_ORDER',
          metadata: { orderId: order.orderId }
        });
        io.emit('notification', notif);
      } else if (order.orderStatus === 'CANCELLED') {
        const notif = await Notification.create({
          title: 'Order Cancelled',
          message: `Order #${order.orderId} has been cancelled by customer/system.`,
          type: 'CANCELLED_ORDER',
          metadata: { orderId: order.orderId }
        });
        io.emit('notification', notif);
      }
    }

    res.json({ success: true, message: 'Data synced successfully' });
  } catch (err: any) {
    console.error('❌ Error processing sync webhook:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

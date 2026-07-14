import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { prisma } from '../config/prisma';

export const getCustomers = async (req: Request, res: Response) => {
  const { search, status, page = '1', limit = '10' } = req.query;

  try {
    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;

    const p = Math.max(1, parseInt(page as string, 10));
    const l = Math.max(1, parseInt(limit as string, 10));
    const skip = (p - 1) * l;

    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
      Customer.countDocuments(query),
    ]);

    res.json({
      data: customers,
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

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Fetch order history for customer
    const orders = await Order.find({ customerId: customer._id }).sort({ createdAt: -1 });

    res.json({ customer, orders });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully', customer });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleCustomerBlock = async (req: Request, res: Response) => {
  const { status } = req.body; // ACTIVE or BLOCKED

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.status = status;
    await customer.save();

    // Sync block state to Postgres
    if (customer.postgresId) {
      await prisma.user.update({
        where: { id: customer.postgresId },
        data: { isBanned: status === 'BLOCKED' }
      });
    }

    res.json({ message: `Customer profile state set to ${status.toLowerCase()}`, customer });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.isDeleted = true;
    await customer.save();

    // Soft delete in Postgres
    if (customer.postgresId) {
      await prisma.user.update({
        where: { id: customer.postgresId },
        data: { isActive: false }
      });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';
import { SyncService } from '../services/sync.service';

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({ isDeleted: false });
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();

    // Sync to Postgres
    await SyncService.syncCouponToPostgres(coupon);

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    // Sync to Postgres
    await SyncService.syncCouponToPostgres(coupon);

    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleCouponState = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    coupon.isActive = isActive;
    await coupon.save();

    await SyncService.syncCouponToPostgres(coupon);

    res.json({ message: `Coupon ${isActive ? 'enabled' : 'disabled'} successfully`, coupon });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    coupon.isDeleted = true;
    await coupon.save();

    res.json({ message: 'Coupon deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

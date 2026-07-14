import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { handleImageUpload } from '../middleware/upload';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find({ isDeleted: false }).sort({ order: 1 });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createBanner = async (req: any, res: Response) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (imageUrl) data.image = imageUrl;

    const banner = new Banner(data);
    await banner.save();

    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBannerOrder = async (req: Request, res: Response) => {
  const { bannerOrders } = req.body; // Array of { id, order }

  try {
    for (const item of bannerOrders) {
      await Banner.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ message: 'Banner sequence updated successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });

    banner.isDeleted = true;
    await banner.save();

    res.json({ message: 'Banner deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

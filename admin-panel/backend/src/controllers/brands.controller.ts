import { Request, Response } from 'express';
import { Brand } from '../models/Brand';
import { SyncService } from '../services/sync.service';
import { handleImageUpload } from '../middleware/upload';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find({ isDeleted: false });
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createBrand = async (req: any, res: Response) => {
  try {
    let logoUrl = '';
    if (req.file) {
      logoUrl = await handleImageUpload(req.file);
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (logoUrl) data.logo = logoUrl;

    const brand = new Brand(data);
    await brand.save();

    // Sync to Postgres
    await SyncService.syncBrandToPostgres(brand);

    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBrand = async (req: any, res: Response) => {
  try {
    let logoUrl = '';
    if (req.file) {
      logoUrl = await handleImageUpload(req.file);
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (logoUrl) data.logo = logoUrl;

    const brand = await Brand.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    // Sync to Postgres
    await SyncService.syncBrandToPostgres(brand);

    res.json({ message: 'Brand updated successfully', brand });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBrand = async (req: any, res: Response) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    brand.isDeleted = true;
    await brand.save();

    res.json({ message: 'Brand deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

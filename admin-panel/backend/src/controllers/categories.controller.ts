import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { SyncService } from '../services/sync.service';
import { handleImageUpload } from '../middleware/upload';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isDeleted: false }).populate('parentId');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req: any, res: Response) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (imageUrl) data.image = imageUrl;

    const category = new Category(data);
    await category.save();

    // Sync to Postgres
    await SyncService.syncCategoryToPostgres(category);

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req: any, res: Response) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    }

    const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (imageUrl) data.image = imageUrl;

    const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Sync to Postgres
    await SyncService.syncCategoryToPostgres(category);

    res.json({ message: 'Category updated successfully', category });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req: any, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.isDeleted = true;
    await category.save();

    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticateAdmin, categoriesController.getCategories);
router.post('/', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.single('image'), categoriesController.createCategory);
router.put('/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.single('image'), categoriesController.updateCategory);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), categoriesController.deleteCategory);

export default router;

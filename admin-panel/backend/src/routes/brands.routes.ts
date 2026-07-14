import { Router } from 'express';
import * as brandsController from '../controllers/brands.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticateAdmin, brandsController.getBrands);
router.post('/', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.single('logo'), brandsController.createBrand);
router.put('/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.single('logo'), brandsController.updateBrand);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), brandsController.deleteBrand);

export default router;

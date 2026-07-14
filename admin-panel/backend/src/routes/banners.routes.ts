import { Router } from 'express';
import * as bannersController from '../controllers/banners.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticateAdmin, bannersController.getBanners);
router.post('/', authenticateAdmin, requireRole(['ADMIN']), upload.single('image'), bannersController.createBanner);
router.put('/reorder', authenticateAdmin, requireRole(['ADMIN']), bannersController.updateBannerOrder);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), bannersController.deleteBanner);

export default router;

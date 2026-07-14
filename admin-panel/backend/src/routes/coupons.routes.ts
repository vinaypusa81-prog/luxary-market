import { Router } from 'express';
import * as couponsController from '../controllers/coupons.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { couponSchema } from '../utils/schemas';

const router = Router();

router.get('/', authenticateAdmin, couponsController.getCoupons);
router.post('/', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), validateRequest(couponSchema), couponsController.createCoupon);
router.put('/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), couponsController.updateCoupon);
router.put('/:id/toggle-state', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), couponsController.toggleCouponState);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), couponsController.deleteCoupon);

export default router;

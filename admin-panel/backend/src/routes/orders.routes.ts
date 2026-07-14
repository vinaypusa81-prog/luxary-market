import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateAdmin, ordersController.getOrders);
router.get('/:id', authenticateAdmin, ordersController.getOrderById);
router.put('/:id/status', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), ordersController.updateOrderStatus);
router.put('/:id/ship', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), ordersController.shipOrder);
router.get('/:id/invoice', authenticateAdmin, ordersController.getOrderInvoice);
router.post('/:id/email', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), ordersController.sendInvoiceEmail);

export default router;

import { Router } from 'express';
import * as customersController from '../controllers/customers.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateAdmin, customersController.getCustomers);
router.get('/:id', authenticateAdmin, customersController.getCustomerById);
router.put('/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), customersController.updateCustomer);
router.put('/:id/toggle-block', authenticateAdmin, requireRole(['ADMIN']), customersController.toggleCustomerBlock);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), customersController.deleteCustomer);

export default router;

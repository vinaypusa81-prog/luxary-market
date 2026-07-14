import { Router } from 'express';
import * as productsController from '../controllers/products.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Publicly accessible inside admin local setup
router.get('/', authenticateAdmin, productsController.getProducts);
router.get('/export-csv', authenticateAdmin, productsController.exportProductsCSV);
router.get('/:id', authenticateAdmin, productsController.getProductById);

// Restricted to Admins, Managers
router.post('/', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.array('images', 5), productsController.createProduct);
router.put('/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), upload.array('images', 5), productsController.updateProduct);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), productsController.deleteProduct);

router.post('/duplicate/:id', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), productsController.duplicateProduct);
router.post('/bulk-delete', authenticateAdmin, requireRole(['ADMIN']), productsController.bulkDeleteProducts);
router.post('/bulk-update', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), productsController.bulkUpdateProducts);
router.post('/import-csv', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), productsController.importProductsCSV);

export default router;

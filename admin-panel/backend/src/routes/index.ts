import { Router } from 'express';
import authRoutes from './auth.routes';
import productsRoutes from './products.routes';
import categoriesRoutes from './categories.routes';
import brandsRoutes from './brands.routes';
import ordersRoutes from './orders.routes';
import customersRoutes from './customers.routes';
import couponsRoutes from './coupons.routes';
import bannersRoutes from './banners.routes';
import reviewsRoutes from './reviews.routes';
import settingsRoutes from './settings.routes';
import syncRoutes from './sync.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/orders', ordersRoutes);
router.use('/customers', customersRoutes);
router.use('/coupons', couponsRoutes);
router.use('/banners', bannersRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/settings', settingsRoutes);
router.use('/sync', syncRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

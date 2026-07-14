import { Router } from 'express';
import { syncWebhook, getNotifications, markAllNotificationsRead } from '../controllers/sync.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Storefront webhook endpoint
router.post('/webhook', syncWebhook);

// Notifications endpoints
router.get('/notifications', authenticateAdmin, getNotifications);
router.put('/notifications/read-all', authenticateAdmin, markAllNotificationsRead);

export default router;

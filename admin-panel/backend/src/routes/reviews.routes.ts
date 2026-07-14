import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateAdmin, reviewsController.getReviews);
router.put('/:id/moderate', authenticateAdmin, requireRole(['ADMIN']), reviewsController.moderateReview);
router.post('/:id/reply', authenticateAdmin, requireRole(['ADMIN', 'MANAGER']), reviewsController.replyToReview);
router.delete('/:id', authenticateAdmin, requireRole(['ADMIN']), reviewsController.deleteReview);

export default router;

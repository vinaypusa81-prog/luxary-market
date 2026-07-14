import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticateAdmin, settingsController.getSettings);
router.put('/', authenticateAdmin, requireRole(['ADMIN']), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), settingsController.updateSettings);

export default router;

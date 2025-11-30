import express from 'express';
import { NotificationsController } from '../controllers/notifications.js';

const router = express.Router();

router.get('/:id', NotificationsController.getNotificationByUserId);
router.post('/', NotificationsController.createNotification);
router.put('/:id', NotificationsController.updateNotification);
router.delete('/:id', NotificationsController.deleteNotification);

export default router;
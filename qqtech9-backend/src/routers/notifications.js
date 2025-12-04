import express from 'express';
import { NotificationsController } from '../controllers/notifications.js';

const router = express.Router();

router.get('/me', NotificationsController.getSelfNotifications);
router.put('/:id', NotificationsController.updateNotification);
//router.delete('/:id', NotificationsController.deleteNotification);

export default router;
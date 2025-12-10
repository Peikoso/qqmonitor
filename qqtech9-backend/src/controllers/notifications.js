import { CreateNotificationDto } from '../dto/notifications/create-notification-dto.js'
import { UpdateNotificationsDto } from '../dto/notifications/update-notifications-dto.js';
import { ResponseNotificationsDto } from '../dto/notifications/response-notifications-dto.js';
import { NotificationService } from '../services/notifications.js';

export const NotificationsController = {
    getSelfNotifications: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const notifications = await NotificationService.getSelfNotifications(currentUserFirebaseUid);

        const response = ResponseNotificationsDto.fromArray(notifications);
        
        return res.status(200).json(response);
    },
    
    updateNotification: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;
        const notificationData = req.body;

        const dto = new UpdateNotificationsDto(notificationData).validate();

        const updatedNotification = await NotificationService.updateNotification(id, dto, currentUserFirebaseUid);

        const response = new ResponseNotificationsDto(updatedNotification);

        return res.status(200).json(response);
    },

    createNotification: async (req, res) => {
        const notificationData = req.body;

        const dto = new CreateNotificationDto(notificationData).validate();

        await NotificationService.createNotification(dto);

        return res.status(201).json({ message: "notification sent." });
    },

    deleteNotification: async (req, res) => {
        const id = req.params.id;

        await NotificationService.deleteNotification(id);

        return res.status(204).send();
    },
};
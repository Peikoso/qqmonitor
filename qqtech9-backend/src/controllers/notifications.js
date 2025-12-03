import { UpdateNotificationsDto } from '../dto/notifications/update-notifications-dto.js';
import { ResponseNotificationsDto } from '../dto/notifications/response-notifications-dto.js';
import { NotificationService } from '../services/notifications.js';

export const NotificationsController = {
    getNotificationByUserId: async (req, res) => {
        const id = req.params.id;

        const notifications = await NotificationService.getNotificationsByUserId(id);

        const response = ResponseNotificationsDto.fromArray(notifications);
        
        return res.status(200).json(response);
    },
    
    updateNotification: async (req, res) => {
        const id = req.params.id;
        const notificationData = req.body;

        const dto = new UpdateNotificationsDto(notificationData).validate();

        const updatedNotification = await NotificationService.updateNotification(id, dto);

        const response = new ResponseNotificationsDto(updatedNotification);

        return res.status(200).json(response);
    },

    deleteNotification: async (req, res) => {
        const id = req.params.id;

        await NotificationService.deleteNotification(id);

        return res.status(204).send();
    },
};
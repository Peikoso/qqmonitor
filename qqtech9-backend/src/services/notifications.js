import { Notifications } from "../models/notifications.js";
import { NotificationsRepository } from "../repositories/notifications.js";
import { NotFoundError, ValidationError  } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";
import { UserService } from "./users.js";
import { UserPreferenceService } from "./user-preferences.js";
import { ScheduleService } from "./schedules.js";
import { IncidentService } from "./incidents.js";



export const NotificationService = {
    getNotificationById: async (id) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid notification UUID.');
        }

        const notification = NotificationsRepository.findById(id);

        if(!notification){
            throw new NotFoundError('Notification not found.')
        }

        return notification;
    },


    getNotificationsByUserId: async (id) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid user ID UUID.');
        }

        await UserService.getUserById(id);

        const notifications = await NotificationsRepository.findByUserId(id);

        return notifications;
    },

    createNotification: async (notificationData) => {
        const incident = await IncidentService.getIncidentById(notificationData.incidentId);
        let scheduledUser;
        let userPreferences;
        
        try{
            scheduledUser = await ScheduleService.getCurrentScheduleByRolesId(incident.roles);
            userPreferences = await UserPreferenceService.getUserPreferencesByUserId(scheduledUser.userId);

            if(userPreferences.channels.length === 0){
                throw new NotFoundError('No notification channels configured for the user.');
            }

        } catch(error){
            const notification = new Notifications(notificationData);
            notification.sentAt = new Date();
            notification.status = "FAILED";
            notification.error = error.message;
            notification.userId = scheduledUser?.userId ?? null; 
            notification.channelId = null;   

            await NotificationsRepository.create(notification);
            return;
        }



        for (const channelId of userPreferences.channels) {
            const notification = new Notifications(notificationData);
            notification.userId = scheduledUser.userId;
            notification.sentAt = new Date();
            notification.channelId = channelId;

            try{
                notification.status = 'SENT';
                notification.error = null;

                await NotificationsRepository.create(notification);
            } catch(error){
                notification.status = 'FAILED';
                notification.error = error.message;

                await NotificationsRepository.create(notification);
            }
        }
    },

    updateNotification: async (id, dto) => {
        const existingNotification = await NotificationService.getNotificationById(id);

        const updatedNotification = new Notifications({
            ...existingNotification,
            ...dto
        });

        const savedNotification = NotificationsRepository.update(updatedNotification);

        return savedNotification;
    },

    deleteNotification: async (id) => {
        await NotificationService.getNotificationById(id);

        await NotificationsRepository.delete(id);
    },
};
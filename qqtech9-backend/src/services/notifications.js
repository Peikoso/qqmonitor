import { Notifications } from "../models/notifications.js";
import { NotificationsRepository } from "../repositories/notifications.js";
import { NotFoundError, ValidationError  } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";
import { UserService } from "./users.js";
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


    createNotification: async (dto) => {
        const newNotification = new Notifications(dto);

        const savedNotification = await NotificationsRepository.create(newNotification);

        return savedNotification;
    },

    createNotificationForIncidents: async (notificationData) => {
        const newNotification = new Notifications(notificationData);

        const incident = await IncidentService.getIncidentById(newNotification.incidentId);
        const scheduledUser = await ScheduleService.getCurrentScheduleByRolesId(incident.roles);

        const savedNotification = await NotificationsRepository.create(newNotification);

        return savedNotification;
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
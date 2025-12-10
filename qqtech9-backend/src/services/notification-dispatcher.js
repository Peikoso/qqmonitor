import nodemailer from "nodemailer";
import { ChannelService } from './channels.js';
import { UserService } from './users.js';
import { admin } from '../config/firebase.js';

export const notificationDispatcher = {
    dispatchNotification: async (notification) => {
        try {
            const channel = await ChannelService.getChannelById(notification.channelId);
            const user = await UserService.getUserById(notification.userId);

            if(channel.isActive === false) {
                throw new Error(`Channel ${channel.id} is inactive.`);
            }

            if(channel.type === 'EMAIL') {
                await notificationDispatcher.dispatchEmail(channel, notification, user);
            }

            if(channel.type === 'PUSH') {
                await notificationDispatcher.dispatchPush(notification, user);
            }

        } catch (error) {
            throw error;
        }
    },

    dispatchEmail: async (channel, notification, user) => {
        const transporter = nodemailer.createTransport({
            service: channel.config.service,
            auth: {
                user: channel.config.user,
                pass: channel.config.password,
            },
        });

        
        await transporter.sendMail({
            from: "QQ Monitor",
            to: user.email,
            subject: notification.title,
            text: notification.message,
        });
    },

    dispatchPush: async (notification, user) => {
        if (!user.fcmToken) {
            throw new Error(`User ${user.id} does not have FCM token`);
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.message
            },
            data: {
                incidentId: notification.incidentId.toString(),
                type: 'incident_notification'
            },
            token: user.fcmToken
        };

        await admin.messaging().send(message);
    }

}
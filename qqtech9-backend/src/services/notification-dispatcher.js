import nodemailer from "nodemailer";
import { ChannelService } from './channels.js';
import { UserService } from './users.js';

export const notificationDispatcher = {
    dispatchNotification: async (notification) => {
        try {
            const channel = await ChannelService.getChannelById(notification.channelId);
            const user = await UserService.getUserById(notification.userId);

            if(channel.type === 'EMAIL') {
                await notificationDispatcher.dispatchEmail(channel, notification, user);
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
    }

}
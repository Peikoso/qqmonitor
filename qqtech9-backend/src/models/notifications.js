export class Notifications { 
    constructor(notification){
        this.id = notification.id;
        this.incidentId = notification.incident_id ?? notification.incidentId;
        this.channelId = notification.channel_id ?? notification.channelId;
        this.userId = notification.user_id ?? notification.userId;
        this.title = notification.title;
        this.message = notification.message;
        this.sentAt = notification.sent_at ?? notification.sentAt;
        this.status = notification.status;
        this.readAt = notification.read_at ?? notification.readAt;
        this.error = notification.error;
        this.createdAt = notification.created_at ?? notification.createdAt;
    }

    static fromArray(notificationsArray) {
        return notificationsArray.map(notification => new Notifications(notification));
    }

};
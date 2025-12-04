export class ResponseNotificationsDto { 
    constructor(notification){
        this.id = notification.id;
        this.incidentId = notification.incidentId;
        this.channelId = notification.channelId;
        this.title = notification.title;
        this.message = notification.message;
        this.status = notification.status;
        this.sentAt = notification.sentAt;
    }

    static fromArray(notificationsArray) {
        return notificationsArray.map(notification => new ResponseNotificationsDto(notification));
    }
};
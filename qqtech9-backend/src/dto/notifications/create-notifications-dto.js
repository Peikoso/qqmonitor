import { ValidationError } from "../../utils/errors.js";
import { validateTimestampFormat } from "../../utils/validations.js";

export class CreateNotificationsDto { 
    constructor(notification){
        this.incidentId = notification.incidentId?.trim();
        this.channelId = notification.channelId?.trim();
        this.userId = notification.userId?.trim();
        this.title = notification.title?.trim();
        this.message = notification.message?.trim();
        this.sentAt = notification.sentAt;
        this.status = notification.status?.trim();
    }

    validate() {
        if(typeof this.incidentId !== 'string' || this.incidentId === '') {
            throw new ValidationError('Incident ID is required and must be a non-empty string');
        }
        if(typeof this.channelId !== 'string' || this.channelId === '') {
            throw new ValidationError('Channel ID is required and must be a non-empty string');
        }
        if(typeof this.userId !== 'string' || this.userId === '') {
            throw new ValidationError('User ID is required and must be a non-empty string');
        }
        if(typeof this.title !== 'string' || this.title === '') {
            throw new ValidationError('Title is required and must be a non-empty string');
        }
        if(typeof this.message !== 'string' || this.message === '') {
            throw new ValidationError('Message is required and must be a non-empty string');
        }
        if(!validateTimestampFormat(this.sentAt)) {
            throw new ValidationError('SentAt must be in a valid timestamp format');
        }
        if(this.status !== 'SENT' && this.status !== 'READED' && this.status !== 'FAILED') {
            throw new ValidationError('Status must be one of the following values: SENT, READED, FAILED');
        }

        return this;
    }

};
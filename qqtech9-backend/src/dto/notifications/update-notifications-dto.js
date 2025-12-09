import { ValidationError } from "../../utils/errors.js";
import { validateTimestampFormat } from "../../utils/validations.js";

export class UpdateNotificationsDto { 
    constructor(notification){
        this.status = notification.status?.trim();
        this.readAt = notification.readAt;
    }

    validate() {
        if(this.status && this.status !== 'SENT' && this.status !== 'READED' && this.status !== 'FAILED') {
            throw new ValidationError('Status must be one of the following values: SENT, READED, FAILED');
        }
        if(this.readAt && !validateTimestampFormat(this.readAt)) {
            throw new ValidationError('ReadAt must be in a valid timestamp format YYYY-MM-DD HH:MM:SS');
        }
        
        return this;
    }

};
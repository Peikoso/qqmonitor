import { ValidationError } from "../../utils/errors.js";

export class CreateNotificationDto {
    constructor(notification){
        this.incidentId = notification.incidentId?.trim();
        this.title = notification.title?.trim();
        this.message = notification.message?.trim();
        this.userId = notification.userId?.trim();
    }

    validate(){
        if(!this.incidentId ){
            throw new ValidationError('incidenteId is required.')
        }
        if(typeof this.title !== 'string' || this.title === ''){
            throw new ValidationError('title must be a non-empty string.')
        }
        if(typeof this.message !== 'string' || this.message === ''){
            throw new ValidationError('message must be a non-empty string.')
        }
        if(!this.userId){
            throw new ValidationError('userId is required.')
        }
        if(!this.title.length > 150){
            throw new ValidationError('title cannot exceed 150 characters')
        }

        return this;
    }
}
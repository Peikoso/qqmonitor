import { ValidationError } from "../../utils/errors.js";

export class FcmTokenDto {
    constructor(data){
        this.fcmToken = data.fcmToken?.trim();
    }
    
    validate() {
        if(!this.fcmToken) {
            throw new ValidationError('FCM Token is required.');
        }


        return this;
    }
};
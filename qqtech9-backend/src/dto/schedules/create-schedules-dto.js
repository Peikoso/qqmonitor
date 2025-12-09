import { ValidationError } from '../../utils/errors.js';
import { validateTimestampFormat } from '../../utils/validations.js';

export class CreateSchedulesDto {
    constructor(schedule) {
        this.userId = schedule.userId?.trim();
        this.startTime = schedule.startTime?.trim();
        this.endTime = schedule.endTime?.trim();
    }

    validate() {
        if(!this.userId || this.userId.trim() === '') {
            throw new ValidationError('userId is required');
        }
        if(!validateTimestampFormat(this.startTime)) {
            throw new ValidationError('Start time must be in the format YYYY-MM-DD HH:MM:SS');
        }
        if(!validateTimestampFormat(this.endTime)) {
            throw new ValidationError('End time must be in the format YYYY-MM-DD HH:MM:SS');
        }

        return this;
    }
}

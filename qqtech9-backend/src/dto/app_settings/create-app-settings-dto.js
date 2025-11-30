import { ValidationError} from '../../utils/errors.js';

export class CreateAppSettingsDto {
    constructor(appSettings){
        this.key = appSettings.key?.trim();
        this.value = appSettings.value;
        this.updatedByUserId = appSettings.updatedByUserId?.trim();
    }

    validate() {
        if (typeof this.key !== 'string' || this.key.trim() === '') {
            throw new ValidationError('Key must be a non-empty string.');
        }
        if (typeof this.value !== 'object' || !this.value) {
            throw new ValidationError('Value must be a JSON object.');
        }
        if (typeof this.updatedByUserId !== 'string' || this.updatedByUserId === '') {
            throw new ValidationError('updatedByUserId must be a non-empty string.');
        }
    }
};
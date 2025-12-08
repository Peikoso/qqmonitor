import { ValidationError } from '../../utils/errors.js'

export class UpdateIncidentForManualEscalationDto { 
    constructor(incident) {
        this.assignedUserId = incident.assignedUserId?.trim();
    }

    validate() {
        if (!this.assignedUserId) {
            throw new ValidationError('assignedUserId is required');
        }

        return this;
    }
};
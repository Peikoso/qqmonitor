import { ValidationError } from '../../utils/errors.js'

export class CreateIncidentsDto { 
    constructor(incident) {
        this.ruleId = incident.ruleId?.trim();
        this.priority = incident.priority?.trim();
    }

    validate() {
        if (!this.ruleId) {
            throw new ValidationError('ruleId is required');
        }
        if (this.priority !== 'LOW' && this.priority !== 'MEDIUM' && this.priority !== 'HIGH') {
            throw new ValidationError('Priority must be LOW, MEDIUM, or HIGH');
        }

        return this;
    }
};

export class CreateIncidentsLogsDto {    
    constructor(IncidentsLogs){
        this.comment = IncidentsLogs.comment?.trim();
    }

    validate() {
        if (typeof this.comment !== 'string' || this.comment === '') {
            throw new ValidationError('Comment must be a non-empty string');
        }
        if(this.comment.length > 255){
            throw new ValidationError('Comment cannot exceed 255 characters');
        }

        return this;
    }
};
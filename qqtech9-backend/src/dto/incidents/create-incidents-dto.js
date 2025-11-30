import { ValidationError } from '../../utils/errors.js'

export class CreateIncidentsDto { 
    constructor(incident) {
        this.assignedUserId = incident.assignedUserId?.trim();
        this.ruleId = incident.ruleId?.trim();
        this.priority = incident.priority?.trim();
    }

    validate() {
        if (!this.assignedUserId) {
            throw new ValidationError('assignedUserId is required');
        }
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
        this.incidentId = IncidentsLogs.incidentId?.trim();
        this.comment = IncidentsLogs.comment?.trim();
        this.actionUserId = IncidentsLogs.actionUserId?.trim();
    }

    validate() {
        if (typeof this.comment !== 'string' || this.comment === '') {
            throw new ValidationError('Comment must be a non-empty string');
        }
        if(this.comment.length > 255){
            throw new ValidationError('Comment cannot exceed 255 characters');
        }
        if (!this.incidentId || this.incidentId === '') {
            throw new ValidationError("incidentId is required");
        }
        if (!this.actionUserId || this.actionUserId === '') {
            throw new ValidationError("actionUserId is required");
        }

        return this;
    }
};
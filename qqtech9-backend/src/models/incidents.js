import { BusinessLogicError } from "../utils/errors.js";

export class Incidents {
    constructor(incident) {
        this.id = incident.id;
        this.assignedUserId = incident.assigned_user_id ?? incident.assignedUserId;
        this.ruleId = incident.rule_id ?? incident.ruleId;
        this.status = incident.status ?? 'OPEN';
        this.priority = incident.priority;
        this.ackAt = incident.ack_at ?? incident.ackAt;
        this.closedAt = incident.closed_at ?? incident.closedAt;
        this.escalationLevel = incident.escalation_level ?? incident.escalationLevel;
        this.createdAt = incident.created_at ?? incident.createdAt;
        this.updatedAt = incident.updated_at ?? incident.updatedAt;

        this.roles = incident.roles;
        this.rule = incident.rule;
    }

    static fromArray(incidentsArray) {
        return incidentsArray.map(incident => new Incidents(incident));
    }

    updateStatus(incidentsLogs) {
        this.status = incidentsLogs.currentStatus;

        if(incidentsLogs.currentStatus === 'ACK' && !this.ackAt){
            this.ackAt = incidentsLogs.createdAt;
        }
        if(incidentsLogs.currentStatus === 'CLOSED' && !this.closedAt){
            this.closedAt = incidentsLogs.createdAt;
        }

        this.updatedAt = new Date();
    }
};

export class IncidentsLogs {    
    constructor(incidentsLog){
        this.id = incidentsLog.id;
        this.incidentId = incidentsLog.incident_id ?? incidentsLog.incidentId;
        this.previousStatus = incidentsLog.previous_status ?? incidentsLog.previousStatus;
        this.currentStatus = incidentsLog.current_status ?? incidentsLog.currentStatus;
        this.comment = incidentsLog.comment;
        this.createdAt = incidentsLog.created_at ?? incidentsLog.createdAt;
        
        this.actionUserId = incidentsLog.action_user_id ?? incidentsLog.actionUserId;
        this.actionUser = incidentsLog.action_user ?? incidentsLog.actionUser;
    }

    static fromArray(incidentsLogsArray){
        return incidentsLogsArray.map(incidentsLogs => new IncidentsLogs(incidentsLogs));
    }
    
    nextStatus(status){
        this.previousStatus = status;
        
        if(status === 'OPEN'){
            this.currentStatus = 'ACK';
        }
        if(status === 'ACK'){
            this.currentStatus = 'CLOSED';
        }
        if(status === 'CLOSED'){
            throw new BusinessLogicError('Incident is already CLOSED. No further status updates allowed.');
        }

    }
};
export class ResponseIncidentsDto {
    constructor(incident) {        
        this.id = incident.id;
        this.assignedUserId = incident.assignedUserId;
        this.ruleId = incident.ruleId;
        this.status = incident.status;
        this.priority = incident.priority;
        this.ackAt = incident.ackAt;
        this.closedAt = incident.closedAt;
        this.createdAt = incident.createdAt;
        
        this.roles = incident.roles;
        this.rule = incident.rule;
    }
    
    static fromArray(incidents) {
        return incidents.map(incident => new ResponseIncidentsDto(incident));
    }
};

export class ResponseIncidentsLogsDto {
    constructor(IncidentsLogs){
        this.id = IncidentsLogs.id;
        this.incidentId = IncidentsLogs.incidentId;
        this.previousStatus = IncidentsLogs.previousStatus;
        this.currentStatus = IncidentsLogs.currentStatus;
        this.comment = IncidentsLogs.comment;
        this.actionUserId = IncidentsLogs.actionUserId;
        this.createdAt = IncidentsLogs.createdAt;
    }
    
    static fromArray(incidentsLogs){
        return incidentsLogs.map(incidentsLog => new ResponseIncidentsLogsDto(incidentsLog));
    }
};

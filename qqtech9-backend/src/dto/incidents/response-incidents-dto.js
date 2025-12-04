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
    constructor(incidentsLogs){
        this.id = incidentsLogs.id;
        this.incidentId = incidentsLogs.incidentId;
        this.previousStatus = incidentsLogs.previousStatus;
        this.currentStatus = incidentsLogs.currentStatus;
        this.comment = incidentsLogs.comment;
        this.createdAt = incidentsLogs.createdAt;
        
        this.actionUser = incidentsLogs.actionUser;
    }
    
    static fromArray(incidentsLogs){
        return incidentsLogs.map(incidentsLog => new ResponseIncidentsLogsDto(incidentsLog));
    }
};

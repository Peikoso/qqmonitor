export class ResponseAuditLogsDto {
    constructor(auditLog){
        this.id = auditLog.id;
        this.entityId = auditLog.entityId;
        this.entityType = auditLog.entityType;
        this.actionType = auditLog.actionType;
        this.oldValue = auditLog.oldValue;
        this.newValue = auditLog.newValue;
        this.userId = auditLog.userId;
        this.createdAt = auditLog.createdAt;
    }

    static fromArray(auditLogsArray) {
        return auditLogsArray.map(auditLog => new ResponseAuditLogsDto(auditLog));
    }
};
import { BusinessLogicError } from "../utils/errors.js";

export class AuditLogs {
    constructor(auditLog){
        this.id = auditLog.id;
        this.entityId = auditLog.entity_id ?? auditLog.entityId;
        this.entityType = auditLog.entity_type ?? auditLog.entityType;
        this.actionType = auditLog.action_type ?? auditLog.actionType;
        this.oldValue = auditLog.old_value ?? auditLog.oldValue;
        this.newValue = auditLog.new_value ?? auditLog.newValue;
        this.userId = auditLog.user_id ?? auditLog.userId;
        this.createdAt = auditLog.created_at ?? auditLog.createdAt;
    }

    validateBusinessLogic() {
        if(this.actionType === 'UPDATE' && this.oldValue === this.newValue) {
            throw new BusinessLogicError('For UPDATE action, oldValue and newValue must be different.');
        }
        if(this.actionType === 'CREATE' && this.newValue == null) {
            throw new BusinessLogicError('For CREATE action, newValue must be provided.');
        }
        if(this.actionType === 'DELETE' && this.oldValue == null) {
            throw new BusinessLogicError('For DELETE action, oldValue must be provided.');
        }

        return this;
    }

    static fromArray(auditLogsArray) {
        return auditLogsArray.map(auditLog => new AuditLogs(auditLog));
    }

}
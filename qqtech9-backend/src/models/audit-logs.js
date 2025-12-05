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
        if(typeof this.entityId !== 'string' || this.entityId === '') {
            throw new ValidationError('Entity ID is required for audit log.');
        }
        if(this.entityType !== 'users' && this.entityType !== 'incidents' && 
            this.entityType !== 'channels' && this.entityType !== 'notifications' &&
            this.entityType !== 'notifications' && this.entityType !== 'user_preferences' &&
            this.entityType !== 'rules' && this.entityType !== 'roles' && 
            this.entityType !== 'schedules' && this.entityType !== 'escalation_policies' && 
            this.entityType !== 'runners' && this.entityType !== 'app_settings'
        ) {
            throw new ValidationError(`
                Invalid entity type for audit log, 
                types must be one of users, incidents, channels, notifications, 
                user_preferences, rules, roles, schedules, escalation_policies, runners, app_settings.`
            );
        }
        if(this.actionType !== 'CREATE' && this.actionType !== 'UPDATE' && this.actionType !== 'DELETE') {
            throw new ValidationError('Invalid action type for audit log, types must be one of CREATE, UPDATE, DELETE.');
        }
        if (typeof this.newValue !== "object" || !this.newValue) {
            throw new ValidationError("New value must be a JSON object");
        }
        if (typeof this.oldValue !== "object" || !this.oldValue) {
            throw new ValidationError("Old value must be a JSON object");
        }
        if(typeof this.userId !== 'string' || this.userId === '') {
            throw new ValidationError('User ID is required for audit log.');
        }

        return this;
    }

    static fromArray(auditLogsArray) {
        return auditLogsArray.map(auditLog => new AuditLogs(auditLog));
    }

}
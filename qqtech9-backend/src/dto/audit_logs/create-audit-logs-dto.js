import { ValidationError } from "../../utils/errors.js";

export class CreateAuditLogsDto {
    constructor(auditLog){
        this.entityId = auditLog.entityId?.trim();
        this.entityType = auditLog.entityType?.trim();
        this.actionType = auditLog.actionType?.trim();
        this.oldValue = auditLog.oldValue;
        this.newValue = auditLog.newValue;
        this.userId = auditLog.userId?.trim();
    }

    validate(){
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
};
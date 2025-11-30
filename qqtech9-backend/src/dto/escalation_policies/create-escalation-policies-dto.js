import { ValidationError } from "../../utils/errors.js";

export class CreateEscalationPolicy {
    constructor(escalationPolicy) {
        this.timeoutMs = Number(escalationPolicy.timeoutMs);
        this.roleId = escalationPolicy.roleId?.trim();
        this.isActive = escalationPolicy.isActive;
    }

    validate() {
        if (isNaN(this.timeoutMs) || !Number.isInteger(this.timeoutMs)) {
            throw new ValidationError('Timeout must be a integer number.');
        }
        if (!this.roleId || this.roleId === '') {
            throw new ValidationError('roleId is required and must be a non-empty string.');
        }
        if (typeof this.isActive !== 'boolean') {
            throw new ValidationError('isActive must be a boolean.');
        }
        
        return this;
    }
};

import { ValidationError } from "../../utils/errors.js";

export class CreateEscalationPolicy {
    constructor(escalationPolicy) {
        this.timeoutMs = Number(escalationPolicy.timeoutMs);
        this.isActive = escalationPolicy.isActive;
    }

    validate() {
        if (isNaN(this.timeoutMs) || !Number.isInteger(this.timeoutMs)) {
            throw new ValidationError('Timeout must be a integer number.');
        }
        if (typeof this.isActive !== 'boolean') {
            throw new ValidationError('isActive must be a boolean.');
        }
        
        return this;
    }
};

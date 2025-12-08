import { ValidationError } from "../../utils/errors.js";

export class CreateEscalationPolicy {
    constructor(escalationPolicy) {
        this.timeoutMs = Number(escalationPolicy.timeoutMs);
    }

    validate() {
        if (isNaN(this.timeoutMs) || !Number.isInteger(this.timeoutMs)) {
            throw new ValidationError('Timeout must be a integer number.');
        }
        
        return this;
    }
};

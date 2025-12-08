import { BusinessLogicError } from "../utils/errors.js";

export class EscalationPolicy {
    constructor(escalationPolicy) {
        this.id = escalationPolicy.id;
        this.timeoutMs = escalationPolicy.timeout_ms ?? escalationPolicy.timeoutMs;
        this.createdAt = escalationPolicy.created_at ?? escalationPolicy.createdAt;
        this.updatedAt = escalationPolicy.updated_at ?? escalationPolicy.updatedAt;
    }

    static fromArray(escalationPolicies) {
        return escalationPolicies.map(escalationPolicy => new EscalationPolicy(escalationPolicy));
    }

    validateBusinessLogic() {
        if(this.timeoutMs <= 0) {
            throw new BusinessLogicError('Timeout must be a positive integer.');
        }

        return this;
    }
};
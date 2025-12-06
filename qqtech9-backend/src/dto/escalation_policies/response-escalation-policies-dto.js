export class ResponseEscalationPolicy {
    constructor(escalationPolicy) {
        this.id = escalationPolicy.id;
        this.timeoutMs = escalationPolicy.timeoutMs;
        this.isActive = escalationPolicy.isActive;
    }

    static fromArray(escalationPolicies) {
        return escalationPolicies.map(escalationPolicy => new ResponseEscalationPolicy(escalationPolicy));
    }
}
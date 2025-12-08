export class ResponseEscalationPolicy {
    constructor(escalationPolicy) {
        this.id = escalationPolicy.id;
        this.timeoutMs = escalationPolicy.timeoutMs;
    }

    static fromArray(escalationPolicies) {
        return escalationPolicies.map(escalationPolicy => new ResponseEscalationPolicy(escalationPolicy));
    }
}
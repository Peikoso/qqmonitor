import { EscalationPolicy } from "../models/escalation-policies.js";
import { EscalationPoliciesRepository } from "../repositories/escalation-policies.js";
import { NotFoundError } from "../utils/errors.js";
import { AuthService } from "./auth.js";


export const EscalationPolicyService = {
    getEscalationPolicy: async () => {
        const escalationPolicy = await EscalationPoliciesRepository.find();

        if (!escalationPolicy) {
            throw new NotFoundError(`Escalation Policy not found.`);
        }

        return escalationPolicy;
    },

    createEscalationPolicy: async (dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const newEscalationPolicy = new EscalationPolicy(dto).validateBusinessLogic();

        const savedEscalationPolicy = await EscalationPoliciesRepository.create(newEscalationPolicy);

        return savedEscalationPolicy;
    },

    updateEscalationPolicy: async (dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingEscalationPolicy = await EscalationPolicyService.getEscalationPolicy();

        const updatedEscalationPolicy = new EscalationPolicy({
            ...existingEscalationPolicy,
            ...dto,
            updatedAt: new Date(),
        }).validateBusinessLogic();

        const savedEscalationPolicy = await EscalationPoliciesRepository.update(updatedEscalationPolicy);

        return savedEscalationPolicy;
    },

    deleteEscalationPolicy: async (id, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        await EscalationPolicyService.getEscalationPolicyById(id);

        await EscalationPoliciesRepository.delete(id);
    },
};
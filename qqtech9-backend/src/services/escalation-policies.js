import { EscalationPolicy } from "../models/escalation-policies.js";
import { EscalationPoliciesRepository } from "../repositories/escalation-policies.js";
import { NotFoundError } from "../utils/errors.js";
import { AuthService } from "./auth.js";
import { UserService } from "./users.js";


export const EscalationPolicyService = {
    getEscalationPolicy: async (currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        const escalationPolicy = await EscalationPoliciesRepository.find();

        if (!escalationPolicy) {
            throw new NotFoundError(`Escalation Policy not found.`);
        }

        return escalationPolicy;
    },

    createEscalationPolicy: async (dto, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(user);

        const newEscalationPolicy = new EscalationPolicy(dto).validateBusinessLogic();

        const savedEscalationPolicy = await EscalationPoliciesRepository.create(newEscalationPolicy);

        return savedEscalationPolicy;
    },

    updateEscalationPolicy: async (dto, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(user);

        const existingEscalationPolicy = await EscalationPolicyService.getEscalationPolicy(currentUserFirebaseUid);

        const updatedEscalationPolicy = new EscalationPolicy({
            ...existingEscalationPolicy,
            ...dto,
            updatedAt: new Date(),
        }).validateBusinessLogic();

        const savedEscalationPolicy = await EscalationPoliciesRepository.update(updatedEscalationPolicy);

        return savedEscalationPolicy;
    },

    deleteEscalationPolicy: async (id, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(currentUser);

        await EscalationPolicyService.getEscalationPolicyById(id);

        await EscalationPoliciesRepository.delete(id);
    },
};
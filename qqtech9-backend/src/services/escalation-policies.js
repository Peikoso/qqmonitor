import { EscalationPolicy } from "../models/escalation-policies.js";
import { EscalationPoliciesRepository } from "../repositories/escalation-policies.js";
import { RoleService } from "./roles.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";


export const EscalationPolicyService = {
    getAllEscalationPolicies: async () => {
        const escalationPolicies = await EscalationPoliciesRepository.findAll();

        return escalationPolicies;
    },

    getEscalationPolicyById: async (id) => {
        if(!isValidUuid(id)) {
            throw new ValidationError('Invalid UUID format for id.');
        }

        const escalationPolicy = await EscalationPoliciesRepository.findById(id);

        if (!escalationPolicy) {
            throw new NotFoundError(`Escalation Policy not found.`);
        }

        return escalationPolicy;
    },

    createEscalationPolicy: async (dto) => {
        const newEscalationPolicy = new EscalationPolicy(dto).validateBusinessLogic();

        await RoleService.getRoleById(newEscalationPolicy.roleId);

        const savedEscalationPolicy = await EscalationPoliciesRepository.create(newEscalationPolicy);

        return savedEscalationPolicy;
    },

    updateEscalationPolicy: async (id, dto) => {
        const existingEscalationPolicy = await EscalationPolicyService.getEscalationPolicyById(id);

        const updatedEscalationPolicy = new EscalationPolicy({
            ...existingEscalationPolicy,
            ...dto,
            updatedAt: new Date(),
        }).validateBusinessLogic();

        await RoleService.getRoleById(updatedEscalationPolicy.roleId);

        const savedEscalationPolicy = await EscalationPoliciesRepository.update(updatedEscalationPolicy);

        return savedEscalationPolicy;
    },

    deleteEscalationPolicy: async (id) => {
        await EscalationPolicyService.getEscalationPolicyById(id);

        await EscalationPoliciesRepository.delete(id);
    },
};
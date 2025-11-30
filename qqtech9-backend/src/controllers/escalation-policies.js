import { EscalationPolicyService } from "../services/escalation-policies.js";
import { CreateEscalationPolicy } from "../dto/escalation_policies/create-escalation-policies-dto.js";
import { ResponseEscalationPolicy } from "../dto/escalation_policies/response-escalation-policies-dto.js";

export const EscalationPoliciesController = {
    getAllEscalationPolicies: async (req, res) => {
        const escalationPolicies = await EscalationPolicyService.getAllEscalationPolicies();

        const response = ResponseEscalationPolicy.fromArray(escalationPolicies);

        return res.status(200).json(response);
    },

    createEscalationPolicy: async (req, res) => {
        const escalationPolicyData = req.body;

        const dto = new CreateEscalationPolicy(escalationPolicyData).validate();

        const newEscalationPolicy = await EscalationPolicyService.createEscalationPolicy(dto);

        const response = new ResponseEscalationPolicy(newEscalationPolicy);

        return res.status(201).json(response);
    },

    updateEscalationPolicy: async (req, res) => {
        const id = req.params.id;
        const escalationPolicyData = req.body;

        const dto = new CreateEscalationPolicy(escalationPolicyData).validate();

        const updatedEscalationPolicy = await EscalationPolicyService.updateEscalationPolicy(id, dto);

        const response = new ResponseEscalationPolicy(updatedEscalationPolicy);

        return res.status(200).json(response);
    },

    deleteEscalationPolicy: async (req, res) => {
        const id = req.params.id;

        await EscalationPolicyService.deleteEscalationPolicy(id);

        return res.status(204).send();
    },
};
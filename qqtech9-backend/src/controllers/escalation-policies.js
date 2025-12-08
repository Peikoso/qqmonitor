import { EscalationPolicyService } from "../services/escalation-policies.js";
import { CreateEscalationPolicy } from "../dto/escalation_policies/create-escalation-policies-dto.js";
import { ResponseEscalationPolicy } from "../dto/escalation_policies/response-escalation-policies-dto.js";

export const EscalationPoliciesController = {
    getEscalationPolicy: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const escalationPolicy= await EscalationPolicyService.getEscalationPolicy();

        const response = new ResponseEscalationPolicy(escalationPolicy);

        return res.status(200).json(response);
    },

    createEscalationPolicy: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const escalationPolicyData = req.body;

        const dto = new CreateEscalationPolicy(escalationPolicyData).validate();

        const newEscalationPolicy = await EscalationPolicyService.createEscalationPolicy(dto, currentUserFirebaseUid);

        const response = new ResponseEscalationPolicy(newEscalationPolicy);

        return res.status(201).json(response);
    },

    updateEscalationPolicy: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const escalationPolicyData = req.body;

        const dto = new CreateEscalationPolicy(escalationPolicyData).validate();

        const updatedEscalationPolicy = await EscalationPolicyService.updateEscalationPolicy(dto, currentUserFirebaseUid);

        const response = new ResponseEscalationPolicy(updatedEscalationPolicy);

        return res.status(200).json(response);
    },

    deleteEscalationPolicy: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;

        await EscalationPolicyService.deleteEscalationPolicy(id);

        return res.status(204).send();
    },
};
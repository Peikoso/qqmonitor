import { RuleService } from '../services/rules.js';
import { ResponseRulesDto } from '../dto/rules/response-rules-dto.js';
import { CreateRulesDto } from '../dto/rules/create-rules-dto.js';

export const RulesController = {
    getAllRules: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { name, priority, databaseType, roleId, page, perPage } = req.query;

        const rules = await RuleService.getAllRules(
            currentUserFirebaseUid,
            name,
            priority,
            databaseType,
            roleId,
            page,
            perPage
        );
        
        const response = ResponseRulesDto.fromArray(rules);

        return res.status(200).json(response);

    },

    createRule: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const ruleData = req.body;

        const dto = new CreateRulesDto(ruleData).validate();

        const newRule = await RuleService.createRule(dto, currentUserFirebaseUid);

        const response = new ResponseRulesDto(newRule);

        return res.status(201).json(response);
    },

    updateRule: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;
        const ruleData = req.body;
        
        const dto = new CreateRulesDto(ruleData).validate();

        const updatedRule = await RuleService.updateRule(id, dto, currentUserFirebaseUid);

        const response = new ResponseRulesDto(updatedRule);

        return res.status(200).json(response);
    },

    deleteRule: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;

        await RuleService.deleteRule(id, currentUserFirebaseUid);

        return res.status(204).send();
    }
};
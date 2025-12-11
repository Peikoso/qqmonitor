import { RulesRepository } from '../repositories/rules.js';
import { Rules } from '../models/rules.js';
import { pool } from '../config/database-conn.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { isValidUuid } from '../utils/validations.js'
import { UserService } from './users.js';
import { RoleService } from './roles.js';
import { RunnerService } from './runners.js';
import { AuthService } from './auth.js';

export const RuleService = {
    getAllRules: async (
        currentUserFirebaseUid, name, priority, databaseType, roleId, page, perPage
    ) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const isSuperAdmin = AuthService.isSuperadmin(user);
        await AuthService.requireOperator(user);
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const rules = await RulesRepository.findAll(
            name,
            priority,
            isSuperAdmin,
            databaseType,
            user.roles.map(role => role.id),
            roleId,
            limit,
            offset
        );

        return rules;
    },

    getRuleById: async (id) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid Rule UUID.')
        }

        const rule = await RulesRepository.findById(id)

        if(!rule){
            throw new NotFoundError('Rule not found.')
        }

        return rule;
    },

    createRule: async (dto, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        const client = await pool.connect();

        try{
            await client.query('BEGIN');

            const newRule = new Rules(dto).validateBusinessLogic();

            await AuthService.verifyRoles(user, newRule.roles);

            newRule.userCreatorId = user.id;

            for(const roleId of newRule.roles){
                await RoleService.getRoleById(roleId);
            }

            const savedRule = await RulesRepository.create(newRule, client);

            await RunnerService.createRunnerForRule(savedRule.id, client);

            await client.query('COMMIT');

            return savedRule;

        } catch (error){
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    updateRule: async (id, dto, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const existingRule = await RuleService.getRuleById(id);
        
        await AuthService.requireOperatorAndRole(user, existingRule.roles);

        await AuthService.editRoles(user, existingRule.roles, dto.roles);

        const updatedRule = new Rules({
            ...existingRule,
            ...dto,
            updatedAt: new Date()
        }).validateBusinessLogic();



        for(const roleId of updatedRule.roles){
            await RoleService.getRoleById(roleId);
        }

        const savedRule = await RulesRepository.update(updatedRule);

        return savedRule;
    },

    updateSilenceMode: async (id, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const existingRule = await RuleService.getRuleById(id);

        await AuthService.requireOperatorAndRole(user, existingRule.roles);

        const updatedRule = await RulesRepository.updateSilenceMode(existingRule.id, !existingRule.silenceMode);

        return updatedRule;
    },

    updateRuleActiveStatus: async (id, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const existingRule = await RuleService.getRuleById(id);

        await AuthService.requireOperatorAndRole(user, existingRule.roles);

        const updatedRule = await RulesRepository.updateActiveStatus(existingRule.id, !existingRule.isActive);

        return updatedRule;
    },

    deleteRule: async (id, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(user);

        const rule = await RuleService.getRuleById(id);

        await AuthService.verifyRoles(user, rule.roles);
        
        await RulesRepository.delete(id);
    }
};

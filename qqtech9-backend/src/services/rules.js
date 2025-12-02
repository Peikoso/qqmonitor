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
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const rules = await RulesRepository.findAll(
            name,
            priority,
            user.profile,
            databaseType,
            user.roles.map(role => role.id),
            roleId,
            limit,
            offset
        );

        return rules;
    },

    getRuleById: async (id, currentUserFirebaseUid) => {
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
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const client = await pool.connect();

        try{
            await client.query('BEGIN');

            const newRule = new Rules(dto).validateBusinessLogic();

            const user = await UserService.getSelf(currentUserFirebaseUid);

            newRule.userCreatorId = user.id;

            for(const roleId of newRule.roles){
                await RoleService.getRoleById(roleId, currentUserFirebaseUid);
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
        const existingRule = await RuleService.getRuleById(id, currentUserFirebaseUid);

        const updatedRule = new Rules({
            ...existingRule,
            ...dto,
            updatedAt: new Date()
        }).validateBusinessLogic();

        for(const roleId of updatedRule.roles){
            await RoleService.getRoleById(roleId, currentUserFirebaseUid);
        }

        const savedRule = await RulesRepository.update(updatedRule);

        return savedRule;
    },

    deleteRule: async (id, currentUserFirebaseUid) => {
        await RuleService.getRuleById(id, currentUserFirebaseUid);
        
        await RulesRepository.delete(id);
    }
};

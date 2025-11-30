import { IncidentsRepository, IncidentsLogsRepository } from "../repositories/incidents.js";
import { Incidents, IncidentsLogs } from '../models/incidents.js';
import { isValidUuid } from "../utils/validations.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { RoleService } from "./roles.js";
import { RuleService } from "./rules.js";
import { UserService } from "./users.js";
import { pool } from "../config/database-conn.js";


export const IncidentService = {
    getAllIncidents: async (status, rule_id, priority, page, perPage) => {
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const incidents = await IncidentsRepository.findAll(
            status, 
            rule_id, 
            priority, 
            limit,
            offset
        );

        return incidents;
    },

    getIncidentById: async (id) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid Incident UUID.');
        }

        const incident = await IncidentsRepository.findById(id);

        if(!incident){
            throw new NotFoundError('Incident not found.');
        }

        return incident;

    },

    createIncident: async (dto) => {
        const newIncident = new Incidents(dto);

        await UserService.getUserById(newIncident.assignedUserId);
        await RuleService.getRuleById(newIncident.ruleId);

        for(const roleId of newIncident.roles){
            await RoleService.getRoleById(roleId);
        }

        const savedIncident = await IncidentsRepository.create(newIncident);

        return savedIncident;
    }, 
};

export const IncidentLogService = {

    getIncidentesLogsByIncidentId: async (incidentId) => {
        if(!isValidUuid(incidentId)){
            throw new ValidationError('Invalid Incident UUID.');
        }

        const incidentLogs = await IncidentsLogsRepository.findByIncidentId(incidentId);

        return incidentLogs;
    },

    createIncidentsAction: async (dto) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const newIncidentsLogs = new IncidentsLogs(dto);

            await UserService.getUserById(newIncidentsLogs.actionUserId);
            const incident = await IncidentService.getIncidentById(newIncidentsLogs.incidentId);

            newIncidentsLogs.nextStatus(incident.status);
            const savedIncidentsLogs = await IncidentsLogsRepository.create(newIncidentsLogs, client);

            incident.updateStatus(savedIncidentsLogs);
            await IncidentsRepository.update(incident, client);

            await client.query('COMMIT');

            return savedIncidentsLogs;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    }
};
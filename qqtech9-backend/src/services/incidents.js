import { IncidentsRepository, IncidentsLogsRepository } from "../repositories/incidents.js";
import { Incidents, IncidentsLogs } from '../models/incidents.js';
import { isValidUuid } from "../utils/validations.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { RoleService } from "./roles.js";
import { RuleService } from "./rules.js";
import { UserService } from "./users.js";
import { pool } from "../config/database-conn.js";


export const IncidentService = {
    getAllIncidents: async (currentUserFirebaseUid, status, ruleId, priority, roleId, page, perPage) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const incidents = await IncidentsRepository.findAll(
            status, 
            ruleId, 
            priority,
            user.profile,
            user.roles.map(role => role.id),
            roleId, 
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

    createIncidentsAction: async (incidentId, dto, currentUserFirebaseUid) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const newIncidentsLogs = new IncidentsLogs(dto);

            const user = await UserService.getSelf(currentUserFirebaseUid);
            const incident = await IncidentService.getIncidentById(incidentId);
            
            newIncidentsLogs.incidentId = incident.id;
            newIncidentsLogs.actionUserId = user.id;
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
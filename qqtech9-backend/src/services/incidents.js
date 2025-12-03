import { pool } from "../config/database-conn.js";
import { IncidentsRepository, IncidentsLogsRepository } from "../repositories/incidents.js";
import { Incidents, IncidentsLogs } from '../models/incidents.js';
import { isValidUuid } from "../utils/validations.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { UserService } from "./users.js";
import { NotificationService } from "./notifications.js";
import { RuleService } from "./rules.js";
import { AuthService } from "./auth.js";


export const IncidentService = {
    getAllIncidents: async (currentUserFirebaseUid, status, ruleName, priority, roleId, page, perPage) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const incidents = await IncidentsRepository.findAll(
            status, 
            ruleName, 
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

        const rule = await RuleService.getRuleById(savedIncident.ruleId);

        await NotificationService.createNotification({
            incidentId: savedIncident.id,
            title: 'Novo Incidente Reportado',
            message: `Novo Incidente reportado para Regra: ${rule.name}, Prioridade: ${savedIncident.priority}.`,
        });

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
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const incident = await IncidentService.getIncidentById(incidentId);

        await AuthService.requireOperatorAndRole(user, incident.roles);

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const newIncidentsLogs = new IncidentsLogs(dto);
            
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
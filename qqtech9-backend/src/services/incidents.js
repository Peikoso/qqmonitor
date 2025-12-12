import { pool } from "../config/database-conn.js";
import { IncidentsRepository, IncidentsLogsRepository } from "../repositories/incidents.js";
import { Incidents, IncidentsLogs } from '../models/incidents.js';
import { isValidUuid } from "../utils/validations.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { AuthService } from "./auth.js";
import { UserService } from "./users.js";
import { RuleService } from "./rules.js";
import { ScheduleService } from "./schedules.js";
import { NotificationService } from "./notifications.js";


export const IncidentService = {
    getAllIncidents: async (currentUserFirebaseUid, status, ruleName, priority, roleId, ownIncidents, page, perPage) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const isSuperAdmin = AuthService.isSuperadmin(user);
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const incidents = await IncidentsRepository.findAll(
            status, 
            ruleName, 
            priority,
            isSuperAdmin,
            user.roles.map(role => role.id),
            roleId,
            ownIncidents ? user.id : null, 
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

    getIncidentByIdProtected: async (id, currentUserFirebaseUid) => {
        const incident = await IncidentService.getIncidentById(id);
        const user = await UserService.getSelf(currentUserFirebaseUid);

        await AuthService.requireRole(user, incident.roles);

        return incident;
    },

    getEligibleUsersForIncident: async (incidentId, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const incident = await IncidentService.getIncidentById(incidentId);
        
        await AuthService.requireOperatorAndRole(user, incident.roles);

        const users = await UserService.getUsersForManualEscalation(incident.roles);

        return users;
    },

    createIncident: async (dto) => {
        const newIncident = new Incidents(dto);
        const rule = await RuleService.getRuleById(newIncident.ruleId);
        let scheduledUser;

        try{
            scheduledUser = await ScheduleService.getCurrentScheduleByRolesId(rule.roles);
            
            newIncident.assignedUserId = scheduledUser.userId;
        } catch(error){
            newIncident.assignedUserId = null;
        }
        
        const savedIncident = await IncidentsRepository.create(newIncident);

        await NotificationService.createNotification({
            incidentId: savedIncident.id,
            title: 'Novo Incidente Reportado',
            message: `Novo Incidente reportado para Regra: ${rule.name}, Prioridade: ${savedIncident.priority}.`,
            userId: savedIncident.assignedUserId
        });

        return savedIncident;
    },
    
    updateIncident: async (id, dto, currentUserFirebaseUid, client) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const incident = await IncidentService.getIncidentById(id);

        await AuthService.requireOperatorAndRole(user, incident.roles);

        const toUpdateIncident = new Incidents({
            ...incident,
            ...dto,
            updatedAt: new Date(),
        });

        const updatedIncident = await IncidentsRepository.update(toUpdateIncident, client);

        return updatedIncident;
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

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            const newIncidentsLogs = new IncidentsLogs(dto);
            
            newIncidentsLogs.incidentId = incident.id;
            newIncidentsLogs.actionUserId = user.id;
            newIncidentsLogs.nextStatus(incident.status);
            
            const savedIncidentsLogs = await IncidentsLogsRepository.create(newIncidentsLogs, client);
            
            incident.updateStatus(savedIncidentsLogs);
            await IncidentService.updateIncident(incident.id, incident, currentUserFirebaseUid, client);

            await client.query('COMMIT');

            return savedIncidentsLogs;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    },

    reexecuteIncidentRule: async (incidentId, currentUserFirebaseUid) => {
        const user = await UserService.getSelf(currentUserFirebaseUid);
        const incident = await IncidentService.getIncidentById(incidentId);

        const rule = await RuleService.getRuleById(incident.ruleId);

        try{
            await RuleService.updateRule(rule.id, rule.reexecute(), currentUserFirebaseUid);

        } catch(error){
            throw new Error('Failed to reexecute the rule associated with the incident.');
        }

        const newIncidentsLogs = new IncidentsLogs({
            incidentId: incident.id,
            comment: 'Regra reexecutada manualmente.'
        });

        newIncidentsLogs.actionUserId = user.id;
        newIncidentsLogs.previousStatus = incident.status;
        newIncidentsLogs.currentStatus = 'REEXECUTED';

        await IncidentsLogsRepository.create(newIncidentsLogs);
    }
};
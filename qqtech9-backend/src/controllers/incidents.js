import { IncidentService, IncidentLogService } from '../services/incidents.js';
import { CreateIncidentsDto, CreateIncidentsLogsDto } from '../dto/incidents/create-incidents-dto.js';
import { ResponseIncidentsDto, ResponseIncidentsLogsDto } from '../dto/incidents/response-incidents-dto.js';
import { UpdateIncidentForManualEscalationDto } from '../dto/incidents/update-incidents-dto.js';

export const IncidentsController = {
    getAllIncidents: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { status, ruleName, priority, roleId, page, perPage } = req.query;

        const incidents = await IncidentService.getAllIncidents(
            currentUserFirebaseUid,
            status, 
            ruleName, 
            priority, 
            roleId,
            page, 
            perPage
        );

        const response = ResponseIncidentsDto.fromArray(incidents);

        return res.status(200).json(response);
    },

    getIncidentById: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id

        const incident = await IncidentService.getIncidentByIdProtected(id, currentUserFirebaseUid);

        const response = new ResponseIncidentsDto(incident);

        return res.status(200).json(response);
    },

    getEligibleUsersForIncident: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const incidentId = req.params.id;
        const users = await IncidentService.getEligibleUsersForIncident(incidentId, currentUserFirebaseUid);

        return res.status(200).json(users);
    },

    createIncident: async(req, res) => {
        const incidentData = req.body;

        const dto = new CreateIncidentsDto(incidentData).validate();

        const newIncident = await IncidentService.createIncident(dto);

        const response = new ResponseIncidentsDto(newIncident);

        return res.status(201).json(response);
    },

    updateIncidentForManualEscalation: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;
        const incidentData = req.body;

        const dto = new UpdateIncidentForManualEscalationDto(incidentData).validate();

        const updatedIncident = await IncidentService.updateIncident(id, dto, currentUserFirebaseUid);

        const response = new ResponseIncidentsDto(updatedIncident);

        return res.status(200).json(response);
    },
    
};

export const IncidentsLogsController = {
    getIncidentLogsByIncidentId: async(req, res) => {
        const id = req.params.id;

        const incidentLogs = await IncidentLogService.getIncidentesLogsByIncidentId(id);

        const response = ResponseIncidentsLogsDto.fromArray(incidentLogs);

        return res.status(200).json(response);
    },
    
    createIncidentsAction: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const incidentId = req.params.id;
        const incidentLogData = req.body;

        const dto = new CreateIncidentsLogsDto(incidentLogData).validate();

        const newIncidentLog = await IncidentLogService.createIncidentsAction(incidentId, dto, currentUserFirebaseUid);

        const response = new ResponseIncidentsLogsDto(newIncidentLog);

        return res.status(201).json(response);
    },

    reexecuteIncidentRule: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const incidentId = req.params.id;

        await IncidentLogService.reexecuteIncidentRule(incidentId, currentUserFirebaseUid);

        return res.status(204).send();
    },
};
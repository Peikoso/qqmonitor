import { IncidentService, IncidentLogService } from '../services/incidents.js';
import { CreateIncidentsDto, CreateIncidentsLogsDto } from '../dto/incidents/create-incidents-dto.js';
import { ResponseIncidentsDto, ResponseIncidentsLogsDto } from '../dto/incidents/response-incidents-dto.js';

export const IncidentsController = {
    getAllIncidents: async(req, res) => {
        const { status, rule_id, priority, page, perPage } = req.query;

        const incidents = await IncidentService.getAllIncidents(
            status, 
            rule_id, 
            priority, 
            page, 
            perPage
        );

        const response = ResponseIncidentsDto.fromArray(incidents);

        return res.status(200).json(response);
    },

    getIncidentById: async(req, res) => {
        const id = req.params.id

        const incident = await IncidentService.getIncidentById(id);

        const response = new ResponseIncidentsDto(incident);

        return res.status(200).json(response);
    },

    createIncident: async(req, res) => {
        const incidentData = req.body;

        const dto = new CreateIncidentsDto(incidentData).validate();

        const newIncident = await IncidentService.createIncident(dto);

        const response = new ResponseIncidentsDto(newIncident);

        return res.status(201).json(response);
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
        const incidentLogData = req.body;

        const dto = new CreateIncidentsLogsDto(incidentLogData).validate();

        const newIncidentLog = await IncidentLogService.createIncidentsAction(dto);

        const response = new ResponseIncidentsLogsDto(newIncidentLog);

        return res.status(201).json(response);
    }
};
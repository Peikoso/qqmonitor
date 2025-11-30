import { IncidentsController, IncidentsLogsController } from '../controllers/incidents.js';
import express from 'express';

const router = express.Router();

router.get('/', IncidentsController.getAllIncidents);
router.get('/:id', IncidentsController.getIncidentById);
router.post('/', IncidentsController.createIncident)

router.get('/logs/:id', IncidentsLogsController.getIncidentLogsByIncidentId);
router.post('/logs', IncidentsLogsController.createIncidentsAction);

export default router;
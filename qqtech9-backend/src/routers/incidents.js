import { IncidentsController, IncidentsLogsController } from '../controllers/incidents.js';
import express from 'express';

const router = express.Router();

router.get('/', IncidentsController.getAllIncidents);
router.get('/:id', IncidentsController.getIncidentById);
router.post('/', IncidentsController.createIncident)

router.put('/:id/action', IncidentsLogsController.createIncidentsAction);

router.get('/:id/logs', IncidentsLogsController.getIncidentLogsByIncidentId);

export default router;
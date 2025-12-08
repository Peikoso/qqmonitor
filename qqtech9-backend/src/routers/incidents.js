import { IncidentsController, IncidentsLogsController } from '../controllers/incidents.js';
import express from 'express';

const router = express.Router();

router.get('/', IncidentsController.getAllIncidents);
router.get('/:id', IncidentsController.getIncidentById);
router.get('/:id/eligible-users', IncidentsController.getEligibleUsersForIncident);
router.post('/', IncidentsController.createIncident)
router.patch('/:id/manual-escalation', IncidentsController.updateIncidentForManualEscalation);

router.post('/:id/action', IncidentsLogsController.createIncidentsAction);
router.post('/:id/reexecute', IncidentsLogsController.reexecuteIncidentRule);

router.get('/:id/logs', IncidentsLogsController.getIncidentLogsByIncidentId);

export default router;
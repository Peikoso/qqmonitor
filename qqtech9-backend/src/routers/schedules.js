import express from 'express';
import { SchedulesController } from '../controllers/schedules.js';

const router = express.Router();

router.get('/', SchedulesController.getUpcomingSchedules);
router.get('/:id', SchedulesController.getScheduleById);
router.post('/', SchedulesController.createSchedule);
router.put('/:id', SchedulesController.updateSchedule);
router.delete('/:id', SchedulesController.deleteSchedule);

export default router;
import { ScheduleService } from '../services/schedules.js';
import { ResponseSchedulesDto } from '../dto/schedules/response-schedules-dto.js';
import { CreateSchedulesDto } from '../dto/schedules/create-schedules-dto.js';

export const SchedulesController = {
    getUpcomingSchedules: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { userName, roleId, page, perPage } = req.query;

        const schedules = await ScheduleService.getUpcomingSchedules(
            currentUserFirebaseUid, userName, roleId, page, perPage
        );

        const response = ResponseSchedulesDto.fromArray(schedules);

        return res.status(200).json(response);

    },

    createSchedule: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const scheduleData = req.body;

        const dto = new CreateSchedulesDto(scheduleData).validate();

        const newSchedule = await ScheduleService.createSchedule(dto, currentUserFirebaseUid);

        const response = new ResponseSchedulesDto(newSchedule);

        return res.status(201).json(response);
    },

    updateSchedule: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;
        const scheduleData = req.body;

        const dto = new CreateSchedulesDto(scheduleData).validate();

        const updatedSchedule = await ScheduleService.updateSchedule(id, dto, currentUserFirebaseUid);

        const response = new ResponseSchedulesDto(updatedSchedule);

        return res.status(200).json(response);
    },

    deleteSchedule: async(req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const id = req.params.id;

        await ScheduleService.deleteSchedule(id, currentUserFirebaseUid);

        return res.status(204).send();
    }
};
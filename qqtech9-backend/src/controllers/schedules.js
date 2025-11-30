import { ScheduleService } from '../services/schedules.js';
import { ResponseSchedulesDto } from '../dto/schedules/response-schedules-dto.js';
import { CreateSchedulesDto } from '../dto/schedules/create-schedules-dto.js';

export const SchedulesController = {
    getUpcomingSchedules: async(req, res) => {
        const schedules = await ScheduleService.getUpcomingSchedules();

        const response = ResponseSchedulesDto.fromArray(schedules);

        return res.status(200).json(response);

    },

    getScheduleById: async(req, res) => {
        const id = req.params.id;

        const schedule = await ScheduleService.getScheduleById(id);

        const response = new ResponseSchedulesDto(schedule);

        return res.status(200).json(response);

    },

    createSchedule: async(req, res) => {
        const scheduleData = req.body;

        const dto = new CreateSchedulesDto(scheduleData).validate();

        const newSchedule = await ScheduleService.createSchedule(dto);

        const response = new ResponseSchedulesDto(newSchedule);

        return res.status(201).json(response);
    },

    updateSchedule: async(req, res) => {
        const id = req.params.id;
        const scheduleData = req.body;

        const dto = new CreateSchedulesDto(scheduleData).validate();

        const updatedSchedule = await ScheduleService.updateSchedule(id, dto);

        const response = new ResponseSchedulesDto(updatedSchedule);

        return res.status(200).json(response);
    },

    deleteSchedule: async(req, res) => {
        const id = req.params.id;

        await ScheduleService.deleteSchedule(id);

        return res.status(204).send();
    }
};
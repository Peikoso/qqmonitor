import { SchedulesRepository } from "../repositories/schedules.js";
import { Schedules } from "../models/schedules.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";
import { UserService } from "./users.js";
import { AuthService } from "./auth.js";

export const ScheduleService = {
    getUpcomingSchedules: async (currentUserFirebaseUid, userName, roleId, page, perPage) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const nowLocal = new Date().toLocaleString('sv-SE');

        const schedules = await SchedulesRepository.findUpcomingSchedules(
            nowLocal, userName, roleId, limit, offset
        );
        
        return schedules;
    },

    getCurrentScheduleByRolesId: async (roles) => {
        const nowLocal = new Date().toLocaleString('sv-SE');

        const schedule = await SchedulesRepository.findCurrentScheduleByRolesId(roles, nowLocal);

        if(!schedule) {
            throw new NotFoundError(`No current schedule found for the given role ID.`);
        }

        return schedule;
    },

    getScheduleById: async (id) => {
        if(!isValidUuid(id)) {
            throw new ValidationError(`Invalid UUID.`);
        }

        const schedule =  await SchedulesRepository.findById(id);

        if(!schedule) {
            throw new NotFoundError(`Schedule not found.`);
        }

        return schedule;
    },

    createSchedule: async (dto) => {
        const newSchedule = new Schedules(dto);

        await UserService.getUserById(newSchedule.userId);

        const savedSchedule = await SchedulesRepository.create(newSchedule);
        
        return savedSchedule;
    },

    updateSchedule: async (id, dto) => {
        const existingSchedule = await ScheduleService.getScheduleById(id);

        const updatedSchedule  = new Schedules({
            ...existingSchedule,
            ...dto,
            updatedAt: new Date()
        });

        const savedSchedule = await SchedulesRepository.update(updatedSchedule);

        return savedSchedule;
    },

    deleteSchedule: async (id) => {
        await ScheduleService.getScheduleById(id);

        await SchedulesRepository.delete(id);
    }
};
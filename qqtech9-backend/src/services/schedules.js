import { SchedulesRepository } from "../repositories/schedules.js";
import { Schedules } from "../models/schedules.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";
import { UserService } from "./users.js";
import { AuthService } from "./auth.js";

export const ScheduleService = {
    getUpcomingSchedules: async (currentUserFirebaseUid, userName, roleId, page, perPage) => {  
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);
        const isSuperAdmin = AuthService.isSuperadmin(currentUser);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const nowLocal = new Date().toLocaleString('sv-SE');

        const schedules = await SchedulesRepository.findUpcomingSchedules(
            isSuperAdmin, 
            currentUser.roles.map(role => role.id), 
            nowLocal, 
            userName, 
            roleId, 
            limit, 
            offset
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

    createSchedule: async (dto, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const newSchedule = new Schedules(dto);

        const userScheduled = await UserService.getUserById(newSchedule.userId);

        await AuthService.verifyRoles(currentUser, userScheduled.roles);

        const savedSchedule = await SchedulesRepository.create(newSchedule);
        
        return savedSchedule;
    },

    updateSchedule: async (id, dto, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const existingSchedule = await ScheduleService.getScheduleById(id);

        const userScheduled = await UserService.getUserById(existingSchedule.userId);

        await AuthService.verifyRoles(currentUser, userScheduled.roles);

        const newUserScheduled = await UserService.getUserById(dto.userId);

        await AuthService.verifyRoles(currentUser, newUserScheduled.roles);

        const updatedSchedule  = new Schedules({
            ...existingSchedule,
            ...dto,
            updatedAt: new Date()
        });

        const savedSchedule = await SchedulesRepository.update(updatedSchedule);

        return savedSchedule;
    },

    deleteSchedule: async (id, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const existingSchedule = await ScheduleService.getScheduleById(id);

        const userScheduled = await UserService.getUserById(existingSchedule.userId);

        await AuthService.verifyRoles(currentUser, userScheduled.roles);

        await SchedulesRepository.delete(id);
    }
};
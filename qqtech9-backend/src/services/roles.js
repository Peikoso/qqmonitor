import { RolesRepository } from '../repositories/roles.js';
import { Roles } from '../models/roles.js';
import { isValidUuid } from '../utils/validations.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { UserService } from './users.js';
import { AuthService } from './auth.js';


export const RoleService = {
    getAllRoles: async (currentUserFirebaseUid, name, page, perPage) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);

        const userRoles = currentUser.roles.map(role => role.id);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const roles = await RolesRepository.findAll(currentUser.profile, userRoles, name, limit, offset);
        
        return roles;
    },

    getRoleById: async (id, currentUserFirebaseUid) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid Role UUID.');
        }

        const role = await RolesRepository.findById(id);

        if(!role){
            throw new NotFoundError('Role not found.');
        }

        return role;
    },

    createRole: async (dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const newRole = new Roles(dto);

        const savedRole = await RolesRepository.create(newRole);

        return savedRole;
    },

    updateRole: async (id, dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingRole = await RoleService.getRoleById(id, currentUserFirebaseUid);

        const updatedRole = new Roles({
            ...existingRole,
            ...dto,
            updatedAt: new Date()
        });

        const savedRole = await RolesRepository.update(updatedRole);

        return savedRole;
    },

    deleteRole: async (id, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        await RoleService.getRoleById(id, currentUserFirebaseUid);
        
        await RolesRepository.delete(id);
    }
};
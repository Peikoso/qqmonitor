import { RolesRepository } from '../repositories/roles.js';
import { Roles } from '../models/roles.js';
import { isValidUuid } from '../utils/validations.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { UserService } from './users.js';
import { AuthService } from './auth.js';


export const RoleService = {
    getAllRoles: async (currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);

        const userRoles = currentUser.roles.map(role => role.id);

        const roles = await RolesRepository.findAll(currentUser.profile, userRoles);
        
        return roles;
    },

    getRoleById: async (id, currentUserFirebaseUid) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid Role UUID.');
        }

        await AuthService.requireAdmin(currentUserFirebaseUid);

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
        await RoleService.getRoleById(id, currentUserFirebaseUid);
        
        await RolesRepository.delete(id);
    }
};
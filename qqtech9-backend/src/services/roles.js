import { RolesRepository } from '../repositories/roles.js';
import { Roles } from '../models/roles.js';
import { isValidUuid } from '../utils/validations.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { UserService } from './users.js';
import { AuthService } from './auth.js';


export const RoleService = {
    getAllRoles: async (currentUserFirebaseUid, name, page, perPage) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        const isSuperAdmin = AuthService.isSuperadmin(currentUser);

        const userRoles = currentUser.roles.map(role => role.id);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const roles = await RolesRepository.findAll(
            isSuperAdmin, 
            userRoles, 
            name, 
            limit, 
            offset
        );
        
        return roles;
    },

    getRoleById: async (id) => {
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
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(currentUser);

        const newRole = new Roles(dto);

        const savedRole = await RolesRepository.create(newRole);

        return savedRole;
    },

    updateRole: async (id, dto, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(currentUser);

        const existingRole = await RoleService.getRoleById(id);

        if(existingRole.name === 'SuperADM'){
            throw new ValidationError('Cannot update SuperADM role.');
        }

        const updatedRole = new Roles({
            ...existingRole,
            ...dto,
            updatedAt: new Date()
        });

        const savedRole = await RolesRepository.update(updatedRole);

        return savedRole;
    },

    deleteRole: async (id, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireSuperAdmin(currentUser);

        const role = await RoleService.getRoleById(id);

        if(role.name === 'SuperADM'){
            throw new ValidationError('Cannot delete SuperADM role.');
        }
        
        await RolesRepository.delete(id);
    }
};
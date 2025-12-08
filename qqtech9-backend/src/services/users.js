import { UsersRepository } from '../repositories/users.js';
import { Users } from '../models/users.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { isValidUuid } from '../utils/validations.js';
import { RoleService } from './roles.js';
import { AuthService } from './auth.js'
import { admin } from '../config/firebase.js'
import { config } from '../config/index.js';

export const UserService = {
    getAllUsers: async (
        currentUserFirebaseUid, name, matricula, role, pending, profile, page, perPage
    ) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);
        
        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const users = await UsersRepository.findAll(
            name, 
            matricula, 
            role, 
            pending, 
            profile, 
            limit, 
            offset
        );

        return users;
    },

    getAllwithBasicInfo: async (name, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const users = await UsersRepository.findAllwithBasicInfo(name);

        return users;
    },

    getSelf: async (currentUserFirebaseUid) => {
        const user = await UsersRepository.findByFirebaseId(currentUserFirebaseUid);

        if(!user){
            throw new NotFoundError('User not found.');
        }

        return user;
    },

    getUserById: async (id) => {
        if(!isValidUuid(id)){
            throw new ValidationError('Invalid User UUID.');
        }

        const user = await UsersRepository.findById(id);

        if(!user){
            throw new NotFoundError('User not found.');
        }

        return user;
    },

    createUser: async (dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid)

        const newUser = new Users(dto).activate();

        const fireBaseUser = await admin.auth().createUser({
            email: newUser.email,
            displayName: newUser.name,
            password: config.DEFAULT_PASSWORD
        });

        newUser.firebaseId = fireBaseUser.uid;

        for(const roleId of newUser.roles){
            await RoleService.getRoleById(roleId);
        }

        try{
            const savedUser = await UsersRepository.create(newUser);

            return savedUser;
        } catch(error){
            console.error(error);

            await admin.auth().deleteUser(fireBaseUser.uid);
        }
        
    },

    registerUser: async (dto) => {
        const newUser = new Users(dto).markAsPending();

        const savedUser = await UsersRepository.create(newUser);

        return savedUser;
    },

    approveUser: async (userId, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingUser = await UserService.getUserById(userId, currentUserFirebaseUid);
         
        const fireBaseUser = await admin.auth().createUser({
            email: existingUser.email,
            displayName: existingUser.name,
            password: config.DEFAULT_PASSWORD
        });

        existingUser.firebaseId = fireBaseUser.uid;

        existingUser.activate();
        
        const savedUser = await UsersRepository.update(existingUser);

        return savedUser;
    },

    adminUpdateUser: async (id, dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingUser = await UserService.getUserById(id, currentUserFirebaseUid);

        for(const roleId of dto.roles){
            await RoleService.getRoleById(roleId);
        }

        const updatedUser = new Users({
            ...existingUser,
            ...dto,
            updatedAt: new Date(),
        });

        const savedUser = await UsersRepository.update(updatedUser);

        await admin.auth().updateUser(updatedUser.firebaseId,{
            email: savedUser.email,
            displayName: savedUser.name
        })

        return savedUser;
    },

    userUpdateSelf: async (dto, currentUserFirebaseUid) => {
        const existingUser = await UserService.getSelf(currentUserFirebaseUid);

        const updatedUser = new Users({
            ...existingUser,
            ...dto,
            updatedAt: new Date(),
        });

        updatedUser.rolesToIds();

        const savedUser = await UsersRepository.update(updatedUser);

        await admin.auth().updateUser(updatedUser.firebaseId,{
            email: savedUser.email,
            displayName: savedUser.name
        })

        return savedUser;
    },

    deleteUser: async (id, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingUser = await UserService.getUserById(id, currentUserFirebaseUid);

        await UsersRepository.delete(id);

        if(existingUser.firebaseId){
            await admin.auth().deleteUser(existingUser.firebaseId)
        }
    },

};
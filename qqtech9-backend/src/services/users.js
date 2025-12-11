import { UsersRepository } from '../repositories/users.js';
import { Users } from '../models/users.js';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { isValidUuid } from '../utils/validations.js';
import { RoleService } from './roles.js';
import { AuthService } from './auth.js'
import { admin } from '../config/firebase.js'
import { config } from '../config/index.js';
import { redact } from '../utils/redact.js';

export const UserService = {
    getAllUsers: async (
        currentUserFirebaseUid, name, matricula, role, pending, profile, page, perPage
    ) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);
        const isSuperAdmin = AuthService.isSuperadmin(currentUser);

        const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
        const limit = parseInt(perPage) > 0 ? parseInt(perPage) : 10;
        const offset = (pageNumber - 1) * limit;

        const users = await UsersRepository.findAll(
            isSuperAdmin,
            currentUser.roles.map(role => role.id),
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
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);
        const isSuperAdmin = AuthService.isSuperadmin(currentUser);

        const users = await UsersRepository.findAllwithBasicInfo(
            isSuperAdmin,
            currentUser.roles.map(role => role.id),
            name
        );

        return users;
    },

    getUsersForManualEscalation: async (rolesId) => {
        const users = await UsersRepository.findEligibleUsersForEscalation(rolesId);

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

    checkEmail: async (email, id = null) => {
        const existingUser = await UsersRepository.checkIfExistsByEmailorMatricula(email, null, id);

        if(existingUser){
            throw new ConflictError('User with given email already exists.');
        }

        return;
    },

    checkMatricula: async (matricula, id = null) => {
        const existingUser = await UsersRepository.checkIfExistsByEmailorMatricula(null, matricula, id);

        if(existingUser){
            throw new ConflictError('User with given matricula already exists.');
        }

        return;
    },

    createUser: async (dto, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const newUser = new Users(dto).activate();

        await UserService.checkEmail(newUser.email);
        await UserService.checkMatricula(newUser.matricula);

        await AuthService.verifyRoles(currentUser, newUser.roles);

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
            console.error(redact(error));

            await admin.auth().deleteUser(fireBaseUser.uid);
        }
        
    },

    registerUser: async (dto) => {
        const newUser = new Users(dto).markAsPending();

        await UserService.checkEmail(newUser.email);
        await UserService.checkMatricula(newUser.matricula);

        const savedUser = await UsersRepository.create(newUser);

        return savedUser;
    },

    approveUser: async (userId, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const existingUser = await UserService.getUserById(userId);

        await AuthService.verifyRoles(currentUser, existingUser.roles);
         
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
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const existingUser = await UserService.getUserById(id);
        
        if(dto.profile === 'admin' || existingUser.profile === 'admin'){
            await AuthService.requireSuperAdmin(currentUser);
        }
        
        await AuthService.verifyRoles(currentUser, existingUser.roles);
        await AuthService.verifyRoles(currentUser, dto.roles);

        for(const roleId of dto.roles){
            await RoleService.getRoleById(roleId);
        }

        const updatedUser = new Users({
            ...existingUser,
            ...dto,
            updatedAt: new Date(),
        });

        await UserService.checkEmail(updatedUser.email, updatedUser.id);
        await UserService.checkMatricula(updatedUser.matricula, updatedUser.id);

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

        
        await UserService.checkEmail(updatedUser.email, updatedUser.id);
        await UserService.checkMatricula(updatedUser.matricula, updatedUser.id);

        const savedUser = await UsersRepository.update(updatedUser);

        await admin.auth().updateUser(updatedUser.firebaseId,{
            email: savedUser.email,
            displayName: savedUser.name
        })

        return savedUser;
    },

    updateFcmToken: async (dto, currentUserFirebaseUid) => {
        const existingUser = await UserService.getSelf(currentUserFirebaseUid);

        const savedUser = await UsersRepository.updateFcmToken(existingUser.id, dto.fcmToken);

        return savedUser;
    },

    deleteUser: async (id, currentUserFirebaseUid) => {
        const currentUser = await UserService.getSelf(currentUserFirebaseUid);
        await AuthService.requireAdmin(currentUser);

        const existingUser = await UserService.getUserById(id);

        if(existingUser.profile === 'admin'){
            await AuthService.requireSuperAdmin(currentUser);
        }

        await AuthService.verifyRoles(currentUser, existingUser.roles);

        if(existingUser.profile === 'admin' && !AuthService.isSuperadmin(currentUser)){
            throw new ForbiddenError('Only superadmin users can delete admin users.');
        }

        await UsersRepository.delete(id);

        if(existingUser.firebaseId){
            await admin.auth().deleteUser(existingUser.firebaseId)
        }
    },

};
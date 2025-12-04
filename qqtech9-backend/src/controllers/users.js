import { UserService } from "../services/users.js";
import { CreateUsersDto, RegisterUsersDto } from "../dto/users/create-users-dto.js";
import { AdminUpdateUsersDto, UpdateUsersDto } from "../dto/users/update-users-dto.js";
import { ResponseUsersDto, ResponseUsersBasicDto } from "../dto/users/response-users-dto.js";

export const UsersController = {
    getAllUsers: async  (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const { name, matricula, role, pending, profile, page, perPage } = req.query;

        const users = await UserService.getAllUsers(
            currentUserFirebaseUid, 
            name, 
            matricula, 
            role, 
            pending, 
            profile, 
            page, 
            perPage
        );

        const response = ResponseUsersDto.fromArray(users);

        return res.status(200).json(response);
    },

    getSelf: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const user = await UserService.getSelf(currentUserFirebaseUid);

        const response = new ResponseUsersDto(user);

        return res.status(200).json(response);
    },

    getUserNameById: async (req, res) => {
        const id = req.params.id;
        
        const user = await UserService.getUserById(id);

        const response = new ResponseUsersBasicDto(user);

        return res.status(200).json(response);
    },

    createUser: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid

        const userData = req.body;

        const dto = new CreateUsersDto(userData).validate();

        const newUser = await UserService.createUser(dto, currentUserFirebaseUid);

        const response = new ResponseUsersDto(newUser);
        
        return res.status(201).json(response);
    },

    registerUser: async (req, res) => {
        const userData = req.body;

        const dto = new RegisterUsersDto(userData).validate();

        const newUser = await UserService.registerUser(dto);

        const response = new ResponseUsersDto(newUser);
        
        return res.status(201).json(response);
    },

    approveUser: async (req, res) => {
        const userId = req.params.userId;
        const currentUserFirebaseUid = req.user.uid;

        const aprovedUser = await UserService.approveUser(userId, currentUserFirebaseUid);

        const response = new ResponseUsersDto(aprovedUser);

        return res.status(200).json(response);
    },

    adminUpdateUser: async (req, res) => {
        const id = req.params.id;
        const userData = req.body;
        const currentUserFirebaseUid = req.user.uid

        const dto = new AdminUpdateUsersDto(userData).validate();

        const updatedUser = await UserService.adminUpdateUser(id, dto, currentUserFirebaseUid);

        const response = new ResponseUsersDto(updatedUser);

        return res.status(200).json(response);
    },

    userUpdateSelf: async (req, res) => {
        const userData = req.body;
        const currentUserFirebaseUid = req.user.uid

        const dto = new UpdateUsersDto(userData).validate();

        const updatedUser = await UserService.userUpdateSelf(dto, currentUserFirebaseUid);

        const response = new ResponseUsersDto(updatedUser);

        return res.status(200).json(response);
    },

    deleteUser: async (req, res) => {
        const id = req.params.id;
        const currentUserFirebaseUid = req.user.uid

        await UserService.deleteUser(id, currentUserFirebaseUid);

        return res.status(204).send();
    }
}
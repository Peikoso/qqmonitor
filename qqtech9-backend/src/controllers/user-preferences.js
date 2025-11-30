import { CreateUserPreferencesDto } from "../dto/user_preferences/create-user-preferences-dto.js";
import { ResponseUserPreferencesDto } from "../dto/user_preferences/response-user-preferences-dto.js";
import { UserPreferenceService } from "../services/user-preferences.js";

export const UserPreferencesController = {
    getUserPreferences: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        const userPreferences = await UserPreferenceService.getUserPreferencesByFirebaseUid(currentUserFirebaseUid);

        const response = new ResponseUserPreferencesDto(userPreferences);

        return res.status(200).json(response);
    },

    createUserPreferences: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const preferencesData = req.body;

        const dto = new CreateUserPreferencesDto(preferencesData).validate();
        
        const newUserPreferences = await UserPreferenceService.createUserPreference(dto, currentUserFirebaseUid);

        const response = new ResponseUserPreferencesDto(newUserPreferences);

        return res.status(201).json(response);
    },

    updateUserPreferences: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;
        const preferencesData = req.body;

        const dto = new CreateUserPreferencesDto(preferencesData).validate();

        const updatedUserPreferences = await UserPreferenceService.updateUserPreferences(dto, currentUserFirebaseUid);

        const response = new ResponseUserPreferencesDto(updatedUserPreferences);

        return res.status(200).json(response);

    },

    deleteUserPreferences: async (req, res) => {
        const currentUserFirebaseUid = req.user.uid;

        await UserPreferenceService.deleteUserPreferences(currentUserFirebaseUid);

        return res.status(204).send();
    },

};
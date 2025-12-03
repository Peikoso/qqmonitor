import { UserPreferences } from "../models/user-preferences.js"
import { UserPreferencesRepository } from "../repositories/user-preferences.js"
import { ValidationError, NotFoundError, BusinessLogicError } from "../utils/errors.js";
import { UserService} from "./users.js";
import { ChannelService } from "./channels.js"; 
import { isValidUuid } from "../utils/validations.js";

export const UserPreferenceService = {  
    getUserPreferencesByUserId: async (userId) => {
        if(!isValidUuid(userId)){
            throw new ValidationError('Invalid user ID UUID.');
        }

        const userPreference = await UserPreferencesRepository.findByUserId(userId);

        if (!userPreference) {
            throw new NotFoundError('User preference not found');
        }
        
        return userPreference;
    },

    createUserPreference: async (dto, currentUserFirebaseUid) => {
        const newUserPreference = new UserPreferences(dto);

        const existingPreference = await UserPreferencesRepository.findByFirebaseUid(currentUserFirebaseUid);   
        if (existingPreference) {
            throw new BusinessLogicError('User preference already exists for this user');
        }

        for (const channelId of newUserPreference.channels) {
            await ChannelService.getChannelById(channelId);
        }

        const user = await UserService.getSelf(currentUserFirebaseUid);
        newUserPreference.userId = user.id;

        const savedUserPreference = await UserPreferencesRepository.create(newUserPreference);

        return savedUserPreference;
    },

    updateUserPreferences: async (dto, currentUserFirebaseUid) => {
        const existingPreference = await UserPreferenceService.getUserPreferencesByFirebaseUid(currentUserFirebaseUid);

        for (const channelId of dto.channels) {
            await ChannelService.getChannelById(channelId);
        }

        const updatedUserPreferences = new UserPreferences({
            ...existingPreference,
            ...dto,
            updatedAt: new Date(),
        });

        const savedUserPreferences = await UserPreferencesRepository.update(updatedUserPreferences);

        return savedUserPreferences;
    },

    deleteUserPreferences: async (currentUserFirebaseUid) => {
        const existingPreference = await UserPreferenceService.getUserPreferencesByFirebaseUid(currentUserFirebaseUid);

        await UserPreferencesRepository.delete(existingPreference.id);
    },
    
};
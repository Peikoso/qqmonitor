import { AppSettingsRepository } from "../repositories/app-settings.js";
import { AppSettings } from "../models/app-settings.js";
import { UserService } from "./users.js";
import { NotFoundError } from "../utils/errors.js";

export const AppSettingService = {
    getAllAppSettings: async () => {
        const appSettings = await AppSettingsRepository.findAll();

        return appSettings
    },

    getAppSettingsByKey: async (key) => {
        const appSettings = await AppSettingsRepository.findByKey(key);

        if(!appSettings){
            throw new NotFoundError('App Settings not found.')
        }

        return appSettings;
    },

    createAppSettings: async (dto) => {
        const appSettings = new AppSettings(dto).validateBusinessLogic();

        await UserService.getUserById(appSettings.updatedByUserId);

        const savedAppSettings = await AppSettingsRepository.create(appSettings);

        return savedAppSettings;
    },

    updateAppSettings: async (dto) => {
        const existingAppSettings = await AppSettingService.getAppSettingsByKey(dto.key);

        const updatedAppSettings = new AppSettings({
            ...existingAppSettings,
            ...dto,
            updatedAt: new Date()
        });

        await UserService.getUserById(updatedAppSettings.updatedByUserId);

        const savedAppSettings = await AppSettingsRepository.update(updatedAppSettings);

        return savedAppSettings;
    },

    deleteAppSettings: async (key) => {
        await AppSettingService.getAppSettingsByKey(key);

        await AppSettingsRepository.delete(key);
    }
};
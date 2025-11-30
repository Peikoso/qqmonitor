import { BusinessLogicError } from "../utils/errors.js";

export class UserPreferences {
    constructor(preferences) {
        this.id = preferences.id;
        this.userId = preferences.user_id ?? preferences.userId;
        this.dndStartTime = preferences.dnd_start_time ?? preferences.dndStartTime;
        this.dndEndTime = preferences.dnd_end_time ?? preferences.dndEndTime;
        this.channels = preferences.channels;
        this.createdAt = preferences.created_at ?? preferences.createdAt;
        this.updatedAt = preferences.updated_at ?? preferences.updatedAt;
    }

    static fromArray(preferencesArray) {
        return preferencesArray.map((preferences) => new UserPreferences(preferences));
    }
    
};
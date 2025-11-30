export class ResponseUserPreferencesDto {
    constructor(preferences) {
        this.id = preferences.id;
        this.userId = preferences.userId;
        this.dndStartTime = preferences.dndStartTime;
        this.dndEndTime = preferences.dndEndTime;
        this.channels = preferences.channels;
    }

    static fromArray(preferencesArray) {
        return preferencesArray.map((preferences) => new ResponseUserPreferencesDto(preferences));
    }

};
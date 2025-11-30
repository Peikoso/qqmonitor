export class AppSettings {
    constructor(appSettings){
        this.key = appSettings.key;
        this.value = appSettings.value;
        this.createdAt = appSettings.created_at ?? appSettings.createdAt;
        this.updatedAt = appSettings.updated_at ?? appSettings.updatedAt;
        this.updatedByUserId = appSettings.updated_by_user_id ?? appSettings.updatedByUserId;
    }

    static fromArray(appSettings){
        return appSettings.map(appSetting => new AppSettings(appSetting));
    }
};
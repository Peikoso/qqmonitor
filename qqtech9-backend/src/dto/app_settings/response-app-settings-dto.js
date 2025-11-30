export class ResponseAppSettingsDto {
    constructor(appSettings){
        this.key = appSettings.key;
        this.value = appSettings.value;
    }

    static fromArray(appSettings){
        return appSettings.map(appSetting => new ResponseAppSettingsDto(appSetting));
    }
};
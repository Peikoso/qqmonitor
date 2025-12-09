export class ResponseChannelsDto {
    constructor(channel) {
        this.id = channel.id;
        this.type = channel.type;
        this.name = channel.name;
        this.config = channel.config;
        this.isActive = channel.isActive;
    }

    static fromArray(channelsArray) {
        return channelsArray.map((channel) => new ResponseChannelsDto(channel));
    }
};

export class ResponseBasicInfoChannelsDto {
    constructor(channel) {
        this.id = channel.id;
        this.type = channel.type;
        this.name = channel.name;
    }

    static fromArray(channelsArray) {
        return channelsArray.map((channel) => new ResponseBasicInfoChannelsDto(channel));
    }
};
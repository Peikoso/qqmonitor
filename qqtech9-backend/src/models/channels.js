export class Channels {
    constructor(channel) {
        this.id = channel.id;
        this.type = channel.type;
        this.name = channel.name;
        this.config = channel.config;
        this.isActive = channel.is_active ?? channel.isActive;
        this.createdAt = channel.created_at ?? channel.createdAt;
        this.updatedAt = channel.updated_at ?? channel.updatedAt;
    }

    static fromArray(channelsArray) {
        return channelsArray.map((channel) => new Channels(channel));
    }
};
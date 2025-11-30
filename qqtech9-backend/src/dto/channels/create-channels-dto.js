import { ValidationError } from "../../utils/errors.js";

export class CreateChannelsDto {
    constructor(channel) {
        this.type = channel.type?.trim();
        this.name = channel.name?.trim();
        this.config = channel.config;
        this.isActive = channel.isActive;
    }

    validate() {
        if (typeof this.type !== 'string' || this.type === '') {
            throw new ValidationError('Channel type is required');
        }
        if (this.type.length > 30) {
            throw new ValidationError('Channel type cannot exceed 30 characters');
        }
        if (typeof this.name !== 'string' || this.name === '') {
            throw new ValidationError('Channel name is required');
        }
        if (this.name.length > 60) {
            throw new ValidationError('Channel name cannot exceed 60 characters');
        }
        if (typeof this.config !== "object" || !this.config) {
            throw new ValidationError("config deve ser um objeto JSON");
        }
        if (typeof this.isActive !== 'boolean') {
            throw new ValidationError('isActive must be a boolean');
        }
        
        return this;
    }
};
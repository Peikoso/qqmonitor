import { ValidationError } from "../../utils/errors.js";

export class CreateRolesDto {
    constructor(role) {
        this.name = role.name?.trim();
        this.color = role.color?.trim();
        this.description = role.description?.trim();
        this.isSuperadmin = role.isSuperadmin;
    }
    
    validate() {
        const COLOR_REGEX = /^#([0-9A-F]{3}){1,2}$/i;

        if (typeof this.name !== 'string' || this.name.trim() === '') {
            throw new ValidationError('Name must be a non-empty string');
        }
        if (typeof this.color !== 'string' || this.color.trim() === '') {
            throw new ValidationError('Color must be a non-empty string');
        }
        if (typeof this.description !== 'string' || this.description.trim() === '') {
            throw new ValidationError('Description must be a non-empty string');
        }
        if (typeof this.isSuperadmin !== 'boolean') {
            throw new ValidationError('isSuperadmin must be a boolean value');
        }
        if(this.name.length > 20){
            throw new ValidationError('Role name cannot exceed 20 characters');
        }
        if(!COLOR_REGEX.test(this.color)){
            throw new ValidationError('Role color must be a valid hex code');
        }
        if(this.color.length > 20){
            throw new ValidationError('Role color cannot exceed 20 characters');
        }
        if(this.description.length > 150){
            throw new ValidationError('Role description cannot exceed 150 characters');
        }

        return this;
    }
}
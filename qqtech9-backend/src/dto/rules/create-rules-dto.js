import { ValidationError } from '../../utils/errors.js';
import { validateTimeFormat } from '../../utils/validations.js';

export class CreateRulesDto {
    constructor(rule) {
        this.name = rule.name?.trim();
        this.description = rule.description?.trim();
        this.databaseType = rule.databaseType?.trim();
        this.sql = rule.sql?.trim();
        this.priority = rule.priority?.trim();
        this.roles = Array.isArray(rule.roles) ? [...new Set(rule.roles)] : [];
        this.executionIntervalMs = Number(rule.executionIntervalMs);
        this.maxErrorCount = Number(rule.maxErrorCount);
        this.timeoutMs = Number(rule.timeoutMs);
        this.startTime = rule.startTime;
        this.endTime = rule.endTime;
        this.notificationEnabled = rule.notificationEnabled;
        this.isActive = rule.isActive;
        this.silenceMode = rule.silenceMode;
        this.postponeDate = rule.postponeDate;
    }

    validate() {
        if(typeof this.name !== 'string' || this.name === '') {
            throw new ValidationError('Name is required and must be a non-empty string');
        }
        if(typeof this.description !== 'string' || this.description === '') {
            throw new ValidationError('Description is required and must be a non-empty string');
        }
        if(this.databaseType !== 'ORACLE' && this.databaseType !== 'POSTGRESQL') {
            throw new ValidationError('Database type must be ORACLE or POSTGRESQL');
        }
        if(typeof this.sql !== 'string' || this.sql === '') {
            throw new ValidationError('SQL is required and must be a non-empty string');
        }
        if(this.priority !== 'LOW' && this.priority !== 'MEDIUM' && this.priority !== 'HIGH') {
            throw new ValidationError('Priority must be LOW, MEDIUM, or HIGH');
        }
        if(!Array.isArray(this.roles) || this.roles.length === 0 || !this.roles.every(role => typeof role === 'string')) {
            throw new ValidationError('Roles must be a non-empty array of strings');
        }
        if(isNaN(this.executionIntervalMs) || !Number.isInteger(this.executionIntervalMs)) {
            throw new ValidationError('Execution interval must be a integer number');
        }
        if(isNaN(this.maxErrorCount) || !Number.isInteger(this.maxErrorCount)) {
            throw new ValidationError('Max error count must be a integer number');
        }
        if(isNaN(this.timeoutMs) || !Number.isInteger(this.timeoutMs)) {
            throw new ValidationError('Timeout must be a integer number');
        }
        if(!validateTimeFormat(this.startTime)) {
            throw new ValidationError('Start time must be in the format HH:MM:SS');
        }
        if(!validateTimeFormat(this.endTime)) {
            throw new ValidationError('End time must be in the format HH:MM:SS');
        }
        if(typeof this.notificationEnabled !== 'boolean') {
            throw new ValidationError('Notification enabled must be a boolean');
        }
        if(typeof this.isActive !== 'boolean') {
            throw new ValidationError('Is active must be a boolean');
        }
        if(this.postponeDate && isNaN(Date.parse(this.postponeDate))) {
            throw new ValidationError('Postpone date must be a Date');
        }
        if(this.name.length > 100) {
            throw new ValidationError('Name must be between 1 and 100 characters');
        }
        if(this.description.length > 255) {
            throw new ValidationError('Description must be between 1 and 255 characters');
        }
        
        return this;
    }

}
import { ValidationError } from '../../utils/errors.js';

export class AdminUpdateUsersDto {
    constructor(user){
        this.name = user.name?.trim();
        this.matricula = user.matricula?.trim();
        this.email = user.email?.trim();
        this.profile = user.profile?.trim();
        this.roles = Array.isArray(user.roles) ? [...new Set(user.roles)] : [];
    }

    validate() {
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/;
        
        if(typeof this.name !== 'string' || this.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string');
        }
        if(typeof this.matricula !== 'string' || this.matricula.trim() === '') {
            throw new ValidationError('Matricula is required and must be a non-empty string');
        }
        if(typeof this.email !== 'string' || this.email.trim() === '') {
            throw new ValidationError('Email is required and must be a non-empty string');
        }
        if(!Array.isArray(this.roles) || !this.roles.every(role => typeof role === 'string')) {
            throw new ValidationError('Roles must be a non-empty array of strings or a empty array');
        }
        if (!NAME_REGEX.test(this.name)){
            throw new ValidationError('Invalid name format');
        }
        if(this.name.length > 100 ){
            throw new ValidationError('Name cannot exceed 100 characters');
        }
        if(this.matricula.length > 30 ){
            throw new ValidationError('Matricula cannot exceed 30 characters');
        }
        if(!EMAIL_REGEX.test(this.email)){
            throw new ValidationError('Invalid email format');
        }
        if(this.email.length > 120 ){
            throw new ValidationError('Email cannot exceed 120 characters');
        }
        if(this.profile !== 'admin' && this.profile !== 'operator' && this.profile !== 'viewer'){
            throw new ValidationError('Profile must be admin, operator, or viewer');
        }

        return this;
    }
};

export class UpdateUsersDto {
    constructor(user){
        this.name = user.name?.trim();
        this.email = user.email?.trim();
        this.phone = String(user.phone);
    }

    validate() {
        const CELULAR_REGEX = /^(\d{2})(\d{5})(\d{4})$/;
        const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)*$/;

        if(typeof this.name !== 'string' || this.name.trim() === '') {
            throw new ValidationError('Name is required and must be a non-empty string');
        }
        if(typeof this.email !== 'string' || this.email.trim() === '') {
            throw new ValidationError('Email is required and must be a non-empty string');
        }
        if (!NAME_REGEX.test(this.name)){
            throw new ValidationError('Invalid name format');
        }
        if(this.name.length > 100 ){
            throw new ValidationError('Name cannot exceed 100 characters');
        }
        if(!EMAIL_REGEX.test(this.email)){
            throw new ValidationError('Invalid email format');
        }
        if(this.email.length > 120 ){
            throw new ValidationError('Email cannot exceed 120 characters');
        }
        if(this.phone && !CELULAR_REGEX.test(this.phone)){
            throw new ValidationError('Invalid phone format');
        }
        if(this.phone && this.phone.length > 20 ){
            throw new ValidationError('Phone cannot exceed 20 characters');
        }


        return this;
    }
};
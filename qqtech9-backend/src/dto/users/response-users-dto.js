export class ResponseUsersDto {
    constructor(user){
        this.id = user.id;
        this.firebaseId = user.firebaseId;
        this.name = user.name;
        this.matricula = user.matricula;
        this.email = user.email;
        this.phone = user.phone;
        this.picture = user.picture;
        this.profile = user.profile;
        this.roles = user.roles;
        this.pending = user.pending;
    }
    
    static fromArray(usersArray) {
        return usersArray.map((user) => new ResponseUsersDto(user));
    }
}


export class ResponseUsersBasicDto {
    constructor(user){
        this.id = user.id;
        this.name = user.name;
        this.matricula = user.matricula;
        this.email = user.email;
        this.profile = user.profile;
        this.roles = user.roles;
    }
    
    static fromArray(usersArray) {
        return usersArray.map((user) => new ResponseUsersBasicDto(user));
    }
}


export class ResponseUsersOnlyIdNameDto {
    constructor(user){
        this.id = user.id;
        this.name = user.name;
    }
    
    static fromArray(usersArray) {
        return usersArray.map((user) => new ResponseUsersOnlyIdNameDto(user));
    }
}
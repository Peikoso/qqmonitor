export class Users {
    constructor(user){
        this.id = user.id;
        this.firebaseId = user.firebase_id ?? user.firebaseId;
        this.name = user.name;
        this.matricula = user.matricula;
        this.email = user.email;
        this.phone = user.phone;
        this.picture = user.picture;
        this.profile = user.profile;
        this.roles = user.roles ?? [];
        this.pending = user.pending;
        this.fcmToken = user.fcm_token ?? user.fcmToken;
        this.createdAt = user.created_at ?? user.createdAt;
        this.updatedAt = user.updated_at ?? user.updatedAt;
    }

    markAsPending(){
        this.pending = true;
        this.profile = 'viewer';

        return this;
    }

    activate(){
        this.pending = false;

        return this;
    }
    
    rolesToIds(){
        this.roles = this.roles.map(role => role.id);

        return this;
    }

    static fromArray(usersArray) {
        return usersArray.map((user) => new Users(user));
    }
}
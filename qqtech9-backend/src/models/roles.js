export class Roles {
    constructor(role){
        this.id = role.id;
        this.name = role.name;
        this.color = role.color;
        this.description = role.description;
        this.createdAt = role.created_at ?? role.createdAt;
        this.updatedAt = role.updated_at ?? role.updatedAt;
    }

    static fromArray(rolesArray) {
        return rolesArray.map(role => new Roles(role));
    }
}
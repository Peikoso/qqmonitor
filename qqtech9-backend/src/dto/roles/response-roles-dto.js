export class ResponseRolesDto {
    constructor(role) {
        this.id = role.id;
        this.name = role.name;
        this.color = role.color;
        this.description = role.description;
    }

    static fromArray(rolesArray) {
        return rolesArray.map(role => new ResponseRolesDto(role));
    }
}
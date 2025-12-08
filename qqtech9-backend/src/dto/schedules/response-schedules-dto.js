export class ResponseSchedulesDto {
    constructor(schedule) {
        this.id = schedule.id;
        this.startTime = schedule.startTime;
        this.endTime = schedule.endTime;
        
        this.userId = schedule.userId;
        this.user = schedule.user;
    }

    static fromArray(schedules) {
        return schedules.map((schedule) => new ResponseSchedulesDto(schedule));
    }
}

import { BusinessLogicError } from "../utils/errors.js";

export class Schedules {
    constructor(schedule) {
        this.id = schedule.id;
        this.userId = schedule.user_id ?? schedule.userId;
        this.startTime = schedule.start_time ?? schedule.startTime;
        this.endTime = schedule.end_time ?? schedule.endTime;
        this.createdAt = schedule.created_at ?? schedule.createdAt;
        this.updatedAt = schedule.updated_at ?? schedule.updatedAt;
    }

    static fromArray(schedules) {
        return schedules.map((schedule) => new Schedules(schedule));
    }

    validateBusinessLogic() {
        if (this.startTime >= this.endTime) {
            throw new BusinessLogicError('Start time must be before end time');
        }

        return this;
    }
}

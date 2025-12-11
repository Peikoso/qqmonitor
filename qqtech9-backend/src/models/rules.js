import { BusinessLogicError } from "../utils/errors.js";
import { validateSQLQueryAST, validateSQLQueryRegex } from '../utils/sql-validation.js';

export class Rules {
    constructor(rule) {
        this.id = rule.id;
        this.name = rule.name;
        this.description = rule.description;
        this.databaseType = rule.database_type ?? rule.databaseType;
        this.sql = rule.sql;
        this.priority = rule.priority;
        this.roles = rule.roles;
        this.executionIntervalMs = rule.execution_interval_ms ?? rule.executionIntervalMs;
        this.maxErrorCount = rule.max_error_count ?? rule.maxErrorCount;
        this.timeoutMs = rule.timeout_ms ?? rule.timeoutMs;
        this.startTime = rule.start_time ?? rule.startTime;
        this.endTime = rule.end_time ?? rule.endTime;
        this.isActive = rule.is_active ?? rule.isActive;
        this.silenceMode = rule.silence_mode ?? rule.silenceMode;
        this.postponeDate = rule.postpone_date ?? rule.postponeDate;
        this.userCreatorId = rule.user_creator_id ?? rule.userCreatorId;
        this.createdAt = rule.created_at ?? rule.createdAt;
        this.updatedAt = rule.updated_at ?? rule.updatedAt;
    }

    static fromArray(rulesArray) {
        return rulesArray.map((rule) => new Rules(rule));
    }

    reexecute() {
        if(!this.isActive){
            this.isActive = true;
        }

        return this;
    }

    validateBusinessLogic() {
        if (!validateSQLQueryRegex(this.sql)) {
            throw new BusinessLogicError('SQL contains forbidden commands');
        }
        if (validateSQLQueryAST(this.sql).valid === false) {
            throw new BusinessLogicError(`${validateSQLQueryAST(this.sql).error}`);
        }
        if (this.postponeDate && new Date(this.postponeDate) < new Date()) {
            throw new BusinessLogicError('Postpone date must be in the future');
        }
        if (this.executionIntervalMs <= 0) {
            throw new BusinessLogicError('Execution interval must be positive');
        }
        if (this.maxErrorCount <= 0) {
            throw new BusinessLogicError('Max error must be positive');
        }
        if (this.timeoutMs <= 0) {
            throw new BusinessLogicError('Timeout must be positive');
        }
        
        return this;
    }
}
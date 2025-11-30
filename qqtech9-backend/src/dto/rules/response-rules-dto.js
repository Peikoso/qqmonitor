export class ResponseRulesDto {
  constructor(rule) {
    this.id = rule.id;
    this.name = rule.name;
    this.description = rule.description;
    this.sql = rule.sql;
    this.priority = rule.priority;
    this.roles = rule.roles;
    this.executionIntervalMs = rule.executionIntervalMs;
    this.maxErrorCount = rule.maxErrorCount;
    this.timeoutMs = rule.timeoutMs;
    this.startTime = rule.startTime;
    this.endTime = rule.endTime;
    this.notificationEnabled = rule.notificationEnabled;
    this.silenceMode = rule.silenceMode;
    this.postponeDate = rule.postponeDate;
    this.isActive = rule.isActive;
    this.userCreatorId = rule.userCreatorId;
  }


  static fromArray(rulesArray) {
    return rulesArray.map((rule) => new ResponseRulesDto(rule));
  }
}

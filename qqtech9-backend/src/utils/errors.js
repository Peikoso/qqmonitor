export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 422; // Unprocessable Entity
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404; // Not Found
  }
}

export class BusinessLogicError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BusinessLogicError';
        this.status = 400; // Bad Request
    }
}

export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.status = 401; // Unauthorized
    }
}

export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.status = 403; // Forbidden
    }
}

export class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
        this.status = 500; // Internal Server Error
    }
}
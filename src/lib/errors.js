export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message, code = 'BAD_REQUEST') {
    super(400, message, code);
    this.name = 'BadRequestError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(403, message, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found', code = 'NOT_FOUND') {
    super(404, message, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message, code = 'CONFLICT') {
    super(409, message, code);
    this.name = 'ConflictError';
  }
}

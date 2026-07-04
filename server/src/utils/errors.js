class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(message, code = 40400) {
    super(message, code, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message, code = 40100) {
    super(message, code, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message, code = 40300) {
    super(message, code, 403);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends AppError {
  constructor(message, code = 40900) {
    super(message, code, 409);
    this.name = 'ConflictError';
  }
}

class ValidationError extends AppError {
  constructor(message, errors = [], code = 422) {
    super(message, code, 422);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError
};

export class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
    this.cause;
  }
}

// Subclase para errores de validación
export class ValidationError extends CustomError {
  constructor(message = "Validation failed") {
    super(422, message);
  }
}

export class ConflictError extends CustomError {
  constructor(message = "Conflict error") {
    super(409, message);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

// Subclase para errores de autenticación
export class AuthenticationError extends CustomError {
  constructor(message = "Authentication failed") {
    super(401, message);
  }
}

// Subclase para errores de autorización
export class AuthorizationError extends CustomError {
  constructor(message = "Access denied") {
    super(403, message);
  }
}

// Subclase para errores de recurso no encontrado
export class NotFoundError extends CustomError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

// Subclase para errores internos del servidor
export class InternalServerError extends CustomError {
  constructor(message = "Internal server error") {
    super(500, message);
  }
}

class AppError extends Error {
  constructor(message, type = 'Error') {
    super(message);
    this.type = type;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

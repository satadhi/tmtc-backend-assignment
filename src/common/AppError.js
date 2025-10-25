class AppError extends Error {
  constructor(message, type = 'Error') {
    super(message);
    this.type = type;
  }
}

module.exports = AppError;

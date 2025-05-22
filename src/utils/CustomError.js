class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name; // Set the error name to the class name
    Error.captureStackTrace(this, this.constructor); // Capture stack trace
  }
}

module.exports = CustomError;

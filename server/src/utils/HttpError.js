// src/utils/HttpError.js
class HttpError extends Error {
  constructor(status, message) {
    super(message);        // sets error.message, like a normal Error
    this.status = status;  // the extra piece: an HTTP status number
    this.name = 'HttpError';
  }
}

export default HttpError;
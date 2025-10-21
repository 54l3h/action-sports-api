export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.status = `${String(statusCode).startsWith("4") ? "fail" : "error"}`;
  }
}

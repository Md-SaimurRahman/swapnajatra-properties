'use strict';
class HttpError extends Error {
  constructor(status, message, details) { super(message); this.status = status; this.details = details; }
}
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (errors) => new HttpError(400, 'Validation failed', errors);
module.exports = { HttpError, wrap, bad };

function validationError(message, details) {
  const error = new Error(message);
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
}

function requireUuid(value, field) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw validationError(`${field} must be a valid UUID`);
  }
  return value;
}

function optionalUuid(value, field) {
  if (value === undefined || value === null || value === '') return null;
  return requireUuid(value, field);
}

function requiredString(value, field, maxLength) {
  if (typeof value !== 'string' || value.trim() === '') throw validationError(`${field} is required`);
  if (value.trim().length > maxLength) throw validationError(`${field} must be at most ${maxLength} characters`);
  return value.trim();
}

function optionalString(value, field, maxLength) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw validationError(`${field} must be a string`);
  if (value.length > maxLength) throw validationError(`${field} must be at most ${maxLength} characters`);
  return value.trim();
}

function enumValue(value, field, allowed) {
  if (!allowed.includes(value)) throw validationError(`${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

function optionalDate(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw validationError(`${field} must be a valid date in YYYY-MM-DD format`);
  }
  return value;
}

module.exports = {
  validationError,
  requireUuid,
  optionalUuid,
  requiredString,
  optionalString,
  enumValue,
  optionalDate
};

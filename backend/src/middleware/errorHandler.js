function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === '23505') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with those values already exists' } });
  }
  if (error.code === '23503') {
    return res.status(400).json({ error: { code: 'INVALID_REFERENCE', message: 'A referenced record does not exist' } });
  }
  if (error.code === '23514' || error.code === '23502') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'The submitted data is invalid' } });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } });
  }

  return res.status(error.status || 500).json({
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.status ? error.message : 'An unexpected error occurred'
    }
  });
}

module.exports = { notFoundHandler, errorHandler };

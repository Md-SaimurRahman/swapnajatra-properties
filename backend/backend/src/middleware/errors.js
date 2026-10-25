'use strict';
function notFound(req, res) {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).type('text/plain').send('Not found');
}
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  if (err.code === '23505') return res.status(409).json({ error: 'A record with this value already exists' });   // unique_violation
  if (err.code === '23514' || err.code === '22P02') return res.status(400).json({ error: 'Invalid value' });       // check / invalid text repr
  const status = err.status && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[error]', req.method, req.originalUrl, err);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message, details: status < 500 ? err.details : undefined });
}
module.exports = { notFound, errorHandler };

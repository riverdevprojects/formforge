function requireApiKey(req, res, next) {
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!apiKey) {
    return next(); // No key configured — skip auth in development
  }

  const provided =
    req.headers['x-api-key'] ||
    req.query.api_key ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!provided || provided !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized. Valid API key required.' });
  }

  next();
}

module.exports = { requireApiKey };

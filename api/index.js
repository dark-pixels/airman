// Vercel serverless entry point.
// All /api/* requests are routed here by vercel.json rewrites.
// The Express app handles routing internally (e.g. /api/people, /api/epr).
module.exports = require('../backend/src/index');

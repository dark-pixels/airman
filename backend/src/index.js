require('dotenv').config();
const express = require('express');
const cors = require('cors');

const peopleRoutes = require('./routes/people');
const eprRoutes = require('./routes/epr');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Fake auth middleware — accept x-user-id header or default to "admin"
app.use((req, _res, next) => {
  req.userId = req.headers['x-user-id'] || 'admin';
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/people', peopleRoutes);
app.use('/api/epr', eprRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server (local dev only) ───────────────────────────────────────────
// When Vercel imports this file as a serverless function it does NOT call
// app.listen(). The `require.main === module` guard ensures listen() is only
// called when the file is run directly (e.g. via nodemon in development).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Skynet EPR API running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless runtime
module.exports = app;

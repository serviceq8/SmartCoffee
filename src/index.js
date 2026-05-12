const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status : 'ok',
    service: 'Smart Coffee API',
    version: '1.0.0',
    time   : new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1/machines', require('./routes/machines'));
app.use('/api/v1/orders',   require('./routes/orders'));
app.use('/api/v1/admin',    require('./routes/admin'));

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Coffee API running on port ${PORT}`);
});

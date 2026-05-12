const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const initDB = require('./db/init');
const pool   = require('./db/pool');
const mqttClient = require('./mqtt/client');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Init database ─────────────────────────────────────────────
initDB();

// ── Connect to HiveMQ ─────────────────────────────────────────
mqttClient.connect();

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  const mqtt = mqttClient.getClient();
  res.json({
    status     : 'ok',
    service    : 'Smart Coffee API',
    version    : '1.0.0',
    time       : new Date().toISOString(),
    mqtt       : mqtt?.connected ? 'connected' : 'disconnected',
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

// ── Heartbeat monitor ─────────────────────────────────────────
// Every 2 minutes — mark machines offline if silent for 3+ minutes
setInterval(async () => {
  try {
    const result = await pool.query(`
      UPDATE machines
      SET status = 'offline'
      WHERE status = 'online'
      AND (
        last_heartbeat IS NULL
        OR last_heartbeat < NOW() - INTERVAL '3 minutes'
      )
      RETURNING id
    `);
    if (result.rows.length > 0) {
      console.log(`Marked offline: ${result.rows.map(r => r.id).join(', ')}`);
    }
  } catch (err) {
    console.error('Heartbeat monitor error:', err.message);
  }
}, 2 * 60 * 1000);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Coffee API running on port ${PORT}`);
});

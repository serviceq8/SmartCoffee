const pool = require('../db/pool');

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ── POST /orders ──────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      machine_id,
      drink_id,
      drink_name,
      customer_name,
      preferred_name,
    } = req.body;

    if (!machine_id || !drink_name || !customer_name) {
      return res.status(400).json({ error: 'machine_id, drink_name and customer_name are required' });
    }

    const code   = generateCode();
    const result = await pool.query(
      `INSERT INTO orders
         (machine_id, drink_id, drink_name, customer_name, preferred_name, code, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'queued')
       RETURNING *`,
      [machine_id, drink_id, drink_name, customer_name, preferred_name, code]
    );

    res.status(201).json({
      ok   : true,
      order: result.rows[0],
      code,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /orders/:id/status ────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, drink_name, customer_name, preferred_name,
              code, created_at, updated_at, completed_at
       FROM orders WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /orders/:id/status ────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, req.params.id]
    );
    res.json({ ok: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /orders/:id/complete ─────────────────────────────────
exports.complete = async (req, res) => {
  try {
    await pool.query(
      `UPDATE orders
       SET status = 'completed', completed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /orders/:id/error ────────────────────────────────────
exports.reportError = async (req, res) => {
  try {
    await pool.query(
      `UPDATE orders SET status = 'error', updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE /orders/:id ────────────────────────────────────────
exports.cancel = async (req, res) => {
  try {
    await pool.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pool = require('../db/pool');

// ── GET /admin/machines ───────────────────────────────────────
exports.getAllMachines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, b.name AS branch_name, b.area, b.latitude, b.longitude
       FROM machines m
       LEFT JOIN branches b ON m.branch_id = b.id
       ORDER BY m.id`
    );
    res.json({ machines: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /admin/machines/:id ───────────────────────────────────
exports.getMachine = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, b.name AS branch_name, b.area
       FROM machines m
       LEFT JOIN branches b ON m.branch_id = b.id
       WHERE m.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json({ machine: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /admin/machines ──────────────────────────────────────
exports.createMachine = async (req, res) => {
  try {
    const { id, name, branch_id, type, secret_key } = req.body;
    const result = await pool.query(
      `INSERT INTO machines (id, name, branch_id, type, secret_key)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, branch_id, type, secret_key]
    );
    res.status(201).json({ ok: true, machine: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /admin/machines/:id ───────────────────────────────────
exports.updateMachine = async (req, res) => {
  try {
    const { name, branch_id, type, status } = req.body;
    const result = await pool.query(
      `UPDATE machines SET name = $1, branch_id = $2, type = $3, status = $4
       WHERE id = $5 RETURNING *`,
      [name, branch_id, type, status, req.params.id]
    );
    res.json({ ok: true, machine: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /admin/orders ─────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, machine_id } = req.query;
    let query  = `SELECT * FROM orders WHERE 1=1`;
    const vals = [];

    if (status) {
      vals.push(status);
      query += ` AND status = $${vals.length}`;
    }
    if (machine_id) {
      vals.push(machine_id);
      query += ` AND machine_id = $${vals.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await pool.query(query, vals);
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /admin/branches ───────────────────────────────────────
exports.getAllBranches = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM branches ORDER BY id`);
    res.json({ branches: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /admin/faults ─────────────────────────────────────────
exports.getAllFaults = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, m.name AS machine_name
       FROM faults f
       LEFT JOIN machines m ON f.machine_id = m.id
       WHERE f.resolved = false
       ORDER BY f.created_at DESC`
    );
    res.json({ faults: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /admin/faults/:id/resolve ─────────────────────────────
exports.resolveFault = async (req, res) => {
  try {
    await pool.query(
      `UPDATE faults SET resolved = true WHERE id = $1`,
      [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

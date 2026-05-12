const pool       = require('../db/pool');
const mqttClient = require('../mqtt/client');

// ── POST /machines/register ───────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { id, secret_key } = req.body;

    if (!id || !secret_key) {
      return res.status(400).json({ error: 'id and secret_key are required' });
    }

    const result = await pool.query(
      `SELECT id, status FROM machines WHERE id = $1 AND secret_key = $2`,
      [id, secret_key]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid machine ID or secret key' });
    }

    await pool.query(
      `UPDATE machines SET status = 'online', last_heartbeat = NOW() WHERE id = $1`,
      [id]
    );

    res.json({
      ok         : true,
      machine_id : id,
      token      : `token-${id}-${Date.now()}`,
      mqtt_topic : `boubyan/machines/${id}/commands`,
      mqtt_broker: process.env.MQTT_BROKER || 'mqtts://1e207622805f4e098c7ee1503aed4068.s1.eu.hivemq.cloud',
      mqtt_port  : 8883,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /machines/:id/heartbeat ──────────────────────────────
exports.heartbeat = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE machines
       SET last_heartbeat = NOW(), status = 'online'
       WHERE id = $1`,
      [id]
    );
    res.json({ ok: true, machine_id: id, time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /machines/:id/status ──────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE machines SET status = $1 WHERE id = $2`,
      [status, id]
    );
    res.json({ ok: true, machine_id: id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /machines/:id/stock ──────────────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const { id }                = req.params;
    const { beans, milk, cups } = req.body;
    await pool.query(
      `UPDATE machines
       SET beans_level = $1, milk_level = $2, cups_level = $3
       WHERE id = $4`,
      [beans, milk, cups, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /machines/:id/fault ──────────────────────────────────
exports.reportFault = async (req, res) => {
  try {
    const { id }                            = req.params;
    const { fault_code, severity, message } = req.body;
    const result = await pool.query(
      `INSERT INTO faults (machine_id, fault_code, severity, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, fault_code, severity, message]
    );
    res.status(201).json({ ok: true, fault: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /machines/:id/verify-code ───────────────────────────
exports.verifyCode = async (req, res) => {
  try {
    const { id }   = req.params;
    const { code } = req.body;

    // Find matching queued order
    const result = await pool.query(
      `SELECT * FROM orders
       WHERE machine_id = $1 AND code = $2 AND status = 'queued'
       ORDER BY created_at ASC LIMIT 1`,
      [id, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired code' });
    }

    const order = result.rows[0];

    // Confirm the order in DB
    await pool.query(
      `UPDATE orders SET status = 'confirmed', updated_at = NOW() WHERE id = $1`,
      [order.id]
    );

    // ── Publish to machine via MQTT ──────────────────────────
    mqttClient.publish(id, {
      type          : 'NEW_ORDER',
      orderId       : order.id,
      drinkName     : order.drink_name,
      customerName  : order.customer_name,
      preferredName : order.preferred_name,
      commandId     : `cmd-${order.id}-${Date.now()}`,
    });

    res.json({ valid: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/:id/orders/pending ─────────────────────────
exports.getPendingOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM orders
       WHERE machine_id = $1 AND status = 'confirmed'
       ORDER BY created_at ASC LIMIT 1`,
      [id]
    );
    res.json({ order: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/:id/content ─────────────────────────────────
exports.getContent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT mc.*,
              json_agg(json_build_object(
                'role',     s.role,
                'name',     s.name,
                'logo_url', s.logo_url
              )) AS suppliers
       FROM machine_content mc
       LEFT JOIN suppliers s ON s.machine_id = mc.machine_id
       WHERE mc.machine_id = $1
       GROUP BY mc.id`,
      [id]
    );
    res.json({ content: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/nearby ──────────────────────────────────────
exports.getNearby = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.type, m.status,
              m.beans_level, m.milk_level, m.cups_level,
              b.name AS branch_name, b.area,
              b.latitude, b.longitude
       FROM machines m
       LEFT JOIN branches b ON m.branch_id = b.id
       WHERE m.status = 'online'
       LIMIT 10`
    );
    res.json({ machines: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/:id ─────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT m.*, b.name AS branch_name, b.area, b.latitude, b.longitude
       FROM machines m
       LEFT JOIN branches b ON m.branch_id = b.id
       WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json({ machine: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/:id/menu ────────────────────────────────────
exports.getMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, icon FROM drinks
       WHERE machine_id = $1 AND available = true
       ORDER BY id`,
      [id]
    );
    res.json({ menu: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /machines/:id/suppliers ───────────────────────────────
exports.getSuppliers = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, role, name, logo_url FROM suppliers WHERE machine_id = $1`,
      [id]
    );
    res.json({ suppliers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

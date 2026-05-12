const fs   = require('fs');
const path = require('path');
const pool = require('./pool');

async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database schema ready');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

module.exports = initDB;

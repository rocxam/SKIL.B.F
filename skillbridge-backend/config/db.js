const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL must be set.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

async function initialize() {
  const client = await pool.connect();
  client.release();
}

async function testConnection() {
  await query('SELECT 1');
}

module.exports = {
  query,
  testConnection,
  initialize,
  pool
};

const dns = require('dns');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL must be set.');
}

function parseDatabaseUrl(urlString) {
  try {
    const url = new URL(urlString);
    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname ? url.pathname.slice(1) : undefined,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      lookup: (hostname, options, callback) => {
        dns.resolve4(hostname, (error, addresses) => {
          if (error) {
            return callback(error);
          }
          return callback(null, addresses[0], 4);
        });
      }
    };
  } catch (error) {
    return { connectionString: urlString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false };
  }
}

const poolConfig = parseDatabaseUrl(connectionString);
const pool = new Pool({
  ...poolConfig,
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

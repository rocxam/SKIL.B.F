const dns = require('dns').promises;
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
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    return { connectionString: urlString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false };
  }
}

const poolConfig = parseDatabaseUrl(connectionString);
let pool;

async function createPool() {
  if (pool) {
    return pool;
  }

  const config = { ...poolConfig, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 };

  if (process.env.NODE_ENV === 'production' && config.host && typeof config.host === 'string') {
    try {
      const addresses = await dns.resolve4(config.host);
      if (addresses && addresses.length > 0) {
        config.host = addresses[0];
      }
    } catch (error) {
      console.warn('IPv4 lookup failed for database host:', error.message);
    }
  }

  pool = new Pool(config);
  return pool;
}

async function query(text, params) {
  const client = await createPool();
  const result = await client.query(text, params);
  return result;
}

async function initialize() {
  const client = await createPool();
  const connection = await client.connect();
  connection.release();
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

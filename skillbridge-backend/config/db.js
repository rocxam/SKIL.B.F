const dns = require('dns').promises;
const net = require('net');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL must be set.');
}

function parseDatabaseUrl(urlString) {
  try {
    const url = new URL(urlString);
    const isSupabase = url.hostname && url.hostname.includes('.supabase.co');
    const useSsl = isSupabase || process.env.NODE_ENV === 'production';

    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname ? url.pathname.slice(1) : undefined,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    const useSsl = process.env.NODE_ENV === 'production';
    return { connectionString: urlString, ssl: useSsl ? { rejectUnauthorized: false } : false };
  }
}

const poolConfig = parseDatabaseUrl(connectionString);
let pool;

async function createPool() {
  if (pool) {
    return pool;
  }

  const config = { ...poolConfig, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 };

  if (config.host && typeof config.host === 'string' && net.isIP(config.host) === 0) {
    try {
      const lookupResult = await dns.lookup(config.host, { family: 4 });
      if (lookupResult && lookupResult.address) {
        console.log(`Resolved database host ${config.host} to IPv4 address ${lookupResult.address}`);
        config.host = lookupResult.address;
      }
    } catch (error) {
      console.warn(`IPv4 lookup failed for database host ${config.host}:`, error.message);
      console.warn('Continuing with original host. If Render is still resolving IPv6, enable NODE_ENV=production or force IPv4 resolution on the platform.');
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

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const backendPath = path.join(__dirname, '..');
const envPath = path.join(backendPath, '.env');

if (!fs.existsSync(envPath)) {
  throw new Error('Missing backend .env file');
}

assert.ok(fs.existsSync(path.join(backendPath, 'server.js')), 'Server entry point missing');
assert.ok(fs.existsSync(path.join(backendPath, 'config', 'db.js')), 'Database config missing');

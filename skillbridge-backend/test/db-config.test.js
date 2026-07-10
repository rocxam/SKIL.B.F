const assert = require('assert');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'config', 'db.js');
const source = fs.readFileSync(dbPath, 'utf8');

assert.ok(source.includes('new Pool('), 'db.js should create a pg Pool');
assert.ok(!source.includes("require('dns')"), 'db.js should not include DNS workaround');
assert.ok(!source.includes("require('net')"), 'db.js should not include networking workaround');
assert.ok(source.includes('connectionString'), 'db.js should use DATABASE_URL / connectionString');

console.log('db config regression test passed');

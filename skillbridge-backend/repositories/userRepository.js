const db = require('../config/db');

async function findByEmail(email) {
  const result = await db.query('SELECT id, full_name, email, phone, password, role, status, created_at, updated_at FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query('SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createUser({ full_name, email, phone, password, role }) {
  const result = await db.query(
    `INSERT INTO users (full_name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`,
    [full_name, email, phone || null, password, role]
  );
  return result.rows[0];
}

async function updateProfile(id, full_name, phone) {
  const result = await db.query(
    `UPDATE users
     SET full_name = $1, phone = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, full_name, email, phone, role, status, created_at, updated_at`,
    [full_name, phone || null, id]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await db.query(
    'SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  getAllUsers
};

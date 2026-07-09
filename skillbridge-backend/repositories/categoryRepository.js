const db = require('../config/db');

async function listCategories() {
  const result = await db.query(
    'SELECT * FROM course_categories WHERE status = $1 ORDER BY name',
    ['active']
  );
  return result.rows;
}

async function getAllCategories() {
  const result = await db.query('SELECT * FROM course_categories ORDER BY name');
  return result.rows;
}

async function createCategory(name, description) {
  const result = await db.query(
    `INSERT INTO course_categories (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [name, description || null]
  );
  return result.rows[0];
}

async function updateCategory(id, updates) {
  const result = await db.query(
    `UPDATE course_categories SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       status = COALESCE($3, status),
       updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [updates.name || null, updates.description || null, updates.status || null, id]
  );
  return result.rows[0];
}

module.exports = {
  listCategories,
  getAllCategories,
  createCategory,
  updateCategory
};

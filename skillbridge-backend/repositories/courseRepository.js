const db = require('../config/db');

async function findCourseById(id) {
  const result = await db.query(
    `SELECT c.*, u.full_name AS teacher_name, cat.name AS category_name
     FROM courses c
     JOIN users u ON u.id = c.teacher_id
     LEFT JOIN course_categories cat ON cat.id = c.category_id
     WHERE c.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function listCourses(filters = {}) {
  const conditions = ['c.status = $1'];
  const values = ['active'];
  let index = 2;

  if (filters.search) {
    conditions.push(`(c.title ILIKE $${index} OR c.description ILIKE $${index + 1})`);
    values.push(`%${filters.search}%`, `%${filters.search}%`);
    index += 2;
  }

  if (filters.category) {
    conditions.push(`c.category_id = $${index}`);
    values.push(filters.category);
    index += 1;
  }

  if (filters.level) {
    conditions.push(`c.level = $${index}`);
    values.push(filters.level);
    index += 1;
  }

  const query = `
    SELECT c.*, u.full_name AS teacher_name, cat.name AS category_name,
      COUNT(e.id) FILTER (WHERE e.status = 'active') AS enrolled_students
    FROM courses c
    JOIN users u ON u.id = c.teacher_id
    LEFT JOIN course_categories cat ON cat.id = c.category_id
    LEFT JOIN enrollments e ON e.course_id = c.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY c.id, u.full_name, cat.name
    ORDER BY c.created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
}

async function listTeacherCourses(teacherId) {
  const result = await db.query(
    `SELECT c.*, cat.name AS category_name,
      COUNT(e.id) FILTER (WHERE e.status = 'active') AS enrolled_students
     FROM courses c
     LEFT JOIN course_categories cat ON cat.id = c.category_id
     LEFT JOIN enrollments e ON e.course_id = c.id
     WHERE c.teacher_id = $1
     GROUP BY c.id, cat.name
     ORDER BY c.created_at DESC`,
    [teacherId]
  );
  return result.rows;
}

async function createCourse({ teacher_id, category_id, title, description, level, duration, cover_image }) {
  const result = await db.query(
    `INSERT INTO courses (teacher_id, category_id, title, description, level, duration, cover_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [teacher_id, category_id || null, title, description, level || 'Beginner', duration || null, cover_image || null]
  );
  return result.rows[0];
}

async function updateCourse(id, updates) {
  const result = await db.query(
    `UPDATE courses SET
       category_id = COALESCE($1, category_id),
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       level = COALESCE($4, level),
       duration = COALESCE($5, duration),
       status = COALESCE($6, status),
       cover_image = COALESCE($7, cover_image),
       updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      updates.category_id || null,
      updates.title || null,
      updates.description || null,
      updates.level || null,
      updates.duration || null,
      updates.status || null,
      updates.cover_image || null,
      id
    ]
  );
  return result.rows[0];
}

async function deactivateCourse(id) {
  const result = await db.query(
    `UPDATE courses SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  findCourseById,
  listCourses,
  listTeacherCourses,
  createCourse,
  updateCourse,
  deactivateCourse
};

const db = require('../config/db');

async function createLesson({ course_id, title, content, lesson_order }) {
  const result = await db.query(
    `INSERT INTO lessons (course_id, title, content, lesson_order)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [course_id, title, content || '', lesson_order || 1]
  );
  return result.rows[0];
}

async function listLessonsByCourse(courseId) {
  const result = await db.query(
    'SELECT * FROM lessons WHERE course_id = $1 AND status = $2 ORDER BY lesson_order ASC',
    [courseId, 'active']
  );
  return result.rows;
}

async function findLessonById(id) {
  const result = await db.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function updateLesson(id, updates) {
  const result = await db.query(
    `UPDATE lessons SET
       title = COALESCE($1, title),
       content = COALESCE($2, content),
       lesson_order = COALESCE($3, lesson_order),
       status = COALESCE($4, status),
       updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [updates.title || null, updates.content || null, updates.lesson_order || null, updates.status || null, id]
  );
  return result.rows[0];
}

async function deactivateLesson(id) {
  const result = await db.query(
    `UPDATE lessons SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createLesson,
  listLessonsByCourse,
  findLessonById,
  updateLesson,
  deactivateLesson
};

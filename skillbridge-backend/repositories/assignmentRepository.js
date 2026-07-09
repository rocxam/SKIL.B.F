const db = require('../config/db');

async function findAssignment(id) {
  const result = await db.query('SELECT * FROM assignments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createAssignment({ course_id, teacher_id, title, instructions, due_date, total_marks, attachment }) {
  const result = await db.query(
    `INSERT INTO assignments (course_id, teacher_id, title, instructions, due_date, total_marks, attachment)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [course_id, teacher_id, title, instructions, due_date || null, total_marks || 100, attachment || null]
  );
  return result.rows[0];
}

async function listAssignmentsByCourse(courseId) {
  const result = await db.query(
    'SELECT * FROM assignments WHERE course_id = $1 AND status = $2 ORDER BY due_date ASC',
    [courseId, 'active']
  );
  return result.rows;
}

async function updateAssignment(id, updates) {
  const result = await db.query(
    `UPDATE assignments SET
       title = COALESCE($1, title),
       instructions = COALESCE($2, instructions),
       due_date = COALESCE($3, due_date),
       total_marks = COALESCE($4, total_marks),
       status = COALESCE($5, status),
       attachment = COALESCE($6, attachment),
       updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      updates.title || null,
      updates.instructions || null,
      updates.due_date || null,
      updates.total_marks || null,
      updates.status || null,
      updates.attachment || null,
      id
    ]
  );
  return result.rows[0];
}

async function deactivateAssignment(id) {
  const result = await db.query(
    `UPDATE assignments SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  findAssignment,
  createAssignment,
  listAssignmentsByCourse,
  updateAssignment,
  deactivateAssignment
};

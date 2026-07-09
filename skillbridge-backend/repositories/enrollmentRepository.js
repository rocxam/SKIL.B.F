const db = require('../config/db');

async function getEnrollment(studentId, courseId) {
  const result = await db.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );
  return result.rows[0] || null;
}

async function createEnrollment(studentId, courseId) {
  const result = await db.query(
    `INSERT INTO enrollments (student_id, course_id)
     VALUES ($1, $2)
     RETURNING *`,
    [studentId, courseId]
  );
  return result.rows[0];
}

async function listStudentEnrollments(studentId) {
  const result = await db.query(
    `SELECT e.id AS enrollment_id, e.progress_percentage, e.status AS enrollment_status,
      c.*, u.full_name AS teacher_name, cat.name AS category_name
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     JOIN users u ON u.id = c.teacher_id
     LEFT JOIN course_categories cat ON cat.id = c.category_id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function listCourseStudents(courseId) {
  const result = await db.query(
    `SELECT e.id AS enrollment_id, e.progress_percentage, e.status AS enrollment_status,
      u.id, u.full_name, u.email, u.phone, e.enrolled_at
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     WHERE e.course_id = $1
     ORDER BY e.enrolled_at DESC`,
    [courseId]
  );
  return result.rows;
}

async function getEnrollmentById(id) {
  const result = await db.query('SELECT * FROM enrollments WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function updateProgress(id, progress) {
  const result = await db.query(
    `UPDATE enrollments SET progress_percentage = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [progress, id]
  );
  return result.rows[0];
}

module.exports = {
  getEnrollment,
  createEnrollment,
  listStudentEnrollments,
  listCourseStudents,
  getEnrollmentById,
  updateProgress
};

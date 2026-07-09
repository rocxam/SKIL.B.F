const db = require('../config/db');

async function getSubmissionByAssignmentAndStudent(assignmentId, studentId) {
  const result = await db.query(
    'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
    [assignmentId, studentId]
  );
  return result.rows[0] || null;
}

async function createSubmission({ assignment_id, student_id, file_path, comments }) {
  const result = await db.query(
    `INSERT INTO submissions (assignment_id, student_id, file_path, comments)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [assignment_id, student_id, file_path || null, comments || null]
  );
  return result.rows[0];
}

async function updateSubmission(id, updates) {
  const result = await db.query(
    `UPDATE submissions SET
       file_path = COALESCE($1, file_path),
       comments = COALESCE($2, comments),
       status = COALESCE($3, status),
       submitted_at = COALESCE($4, submitted_at),
       marks_awarded = COALESCE($5, marks_awarded),
       feedback = COALESCE($6, feedback),
       graded_at = COALESCE($7, graded_at),
       updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      updates.file_path || null,
      updates.comments || null,
      updates.status || null,
      updates.submitted_at || null,
      updates.marks_awarded || null,
      updates.feedback || null,
      updates.graded_at || null,
      id
    ]
  );
  return result.rows[0];
}

async function listSubmissionsByStudent(studentId) {
  const result = await db.query(
    `SELECT s.*, a.title AS assignment_title, a.total_marks, c.title AS course_title
     FROM submissions s
     JOIN assignments a ON a.id = s.assignment_id
     JOIN courses c ON c.id = a.course_id
     WHERE s.student_id = $1
     ORDER BY s.submitted_at DESC`,
    [studentId]
  );
  return result.rows;
}

async function listSubmissionsByAssignment(assignmentId) {
  const result = await db.query(
    `SELECT s.*, u.full_name AS student_name, u.email AS student_email
     FROM submissions s
     JOIN users u ON u.id = s.student_id
     WHERE s.assignment_id = $1
     ORDER BY s.submitted_at DESC`,
    [assignmentId]
  );
  return result.rows;
}

async function getSubmissionById(id) {
  const result = await db.query('SELECT * FROM submissions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

module.exports = {
  getSubmissionByAssignmentAndStudent,
  createSubmission,
  updateSubmission,
  listSubmissionsByStudent,
  listSubmissionsByAssignment,
  getSubmissionById
};

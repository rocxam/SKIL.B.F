const db = require('../config/db');

async function getStats() {
  const users = await db.query('SELECT COUNT(*) AS total FROM users');
  const courses = await db.query('SELECT COUNT(*) AS total FROM courses');
  const enrollments = await db.query('SELECT COUNT(*) AS total FROM enrollments');
  const submissions = await db.query('SELECT COUNT(*) AS total FROM submissions');

  return {
    users: users[0]?.total || 0,
    courses: courses[0]?.total || 0,
    enrollments: enrollments[0]?.total || 0,
    submissions: submissions[0]?.total || 0
  };
}

async function listCourses() {
  const result = await db.query(
    `SELECT c.*, u.full_name AS teacher_name, cat.name AS category_name
     FROM courses c
     JOIN users u ON u.id = c.teacher_id
     LEFT JOIN course_categories cat ON cat.id = c.category_id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
}

module.exports = {
  getStats,
  listCourses
};

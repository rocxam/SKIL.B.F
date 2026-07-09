const userRepository = require('../repositories/userRepository');
const courseRepository = require('../repositories/courseRepository');
const categoryRepository = require('../repositories/categoryRepository');
const db = require('../config/db');

async function getStats(req, res) {
  try {
    const users = await db.query('SELECT COUNT(*) AS total FROM users');
    const courses = await db.query('SELECT COUNT(*) AS total FROM courses');
    const enrollments = await db.query('SELECT COUNT(*) AS total FROM enrollments');
    const submissions = await db.query('SELECT COUNT(*) AS total FROM submissions');

    return res.json({
      users: Number(users.rows[0].total),
      courses: Number(courses.rows[0].total),
      enrollments: Number(enrollments.rows[0].total),
      submissions: Number(submissions.rows[0].total)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load statistics.', error: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await userRepository.getAllUsers();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load users.', error: error.message });
  }
}

async function getCourses(req, res) {
  try {
    const courses = await courseRepository.listCourses();
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load courses.', error: error.message });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive.' });
    }

    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);
    return res.json({ message: 'User status updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update user status.', error: error.message });
  }
}

async function updateCourseStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive.' });
    }

    await db.query('UPDATE courses SET status = $1 WHERE id = $2', [status, req.params.id]);
    return res.json({ message: 'Course status updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update course status.', error: error.message });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await categoryRepository.getAllCategories();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load categories.', error: error.message });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await categoryRepository.createCategory(name, description);
    return res.status(201).json({ message: 'Category created.', category });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create category.', error: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { name, description, status } = req.body;
    await categoryRepository.updateCategory(req.params.id, {
      name,
      description,
      status
    });
    return res.json({ message: 'Category updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update category.', error: error.message });
  }
}

module.exports = {
  getStats,
  getUsers,
  getCourses,
  updateUserStatus,
  updateCourseStatus,
  getCategories,
  createCategory,
  updateCategory
};

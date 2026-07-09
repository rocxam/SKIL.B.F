const courseRepository = require('../repositories/courseRepository');
const categoryRepository = require('../repositories/categoryRepository');
const userRepository = require('../repositories/userRepository');
const { uploadMaterialFile } = require('../services/storageService');

async function findCourse(id) {
  return courseRepository.findCourseById(id);
}

function canManageCourse(user, course) {
  return user.role === 'admin' || (user.role === 'teacher' && course.teacher_id === user.id);
}

async function getCourses(req, res) {
  try {
    const filters = {
      search: req.query.search || '',
      category: req.query.category || '',
      level: req.query.level || ''
    };

    const courses = await courseRepository.listCourses(filters);
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load courses.', error: error.message });
  }
}

async function getCourseById(req, res) {
  try {
    const course = await courseRepository.findCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    return res.json(course);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load course.', error: error.message });
  }
}

async function createCourse(req, res) {
  try {
    const { category_id, title, description, level, duration } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const coverImage = req.file ? await uploadMaterialFile(req.file) : null;
    const course = await courseRepository.createCourse({
      teacher_id: req.user.id,
      category_id: category_id || null,
      title,
      description,
      level: level || 'Beginner',
      duration: duration || null,
      cover_image: coverImage ? coverImage.file_url : null
    });

    return res.status(201).json({ message: 'Course created.', course });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create course.', error: error.message });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only edit your own courses.' });
    }

    const { category_id, title, description, level, duration, status } = req.body;
    const coverImage = req.file ? await uploadMaterialFile(req.file) : null;
    const updatedCourse = await courseRepository.updateCourse(req.params.id, {
      category_id: category_id || null,
      title,
      description,
      level,
      duration,
      status,
      cover_image: coverImage ? coverImage.file_url : null
    });

    return res.json({ message: 'Course updated.', course: updatedCourse });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update course.', error: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only delete your own courses.' });
    }

    await courseRepository.deactivateCourse(req.params.id);
    return res.json({ message: 'Course deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete course.', error: error.message });
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await courseRepository.listTeacherCourses(req.user.id);
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load teacher courses.', error: error.message });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await categoryRepository.listCategories();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load categories.', error: error.message });
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getCategories,
  canManageCourse,
  findCourse
};

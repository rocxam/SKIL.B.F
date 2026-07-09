const lessonRepository = require('../repositories/lessonRepository');
const lessonMaterialRepository = require('../repositories/lessonMaterialRepository');
const courseRepository = require('../repositories/courseRepository');
const { uploadMaterialFile } = require('../services/storageService');

async function studentIsEnrolled(studentId, courseId) {
  const enrollment = await require('../repositories/enrollmentRepository').getEnrollment(studentId, courseId);
  return Boolean(enrollment && enrollment.status === 'active');
}

function canManageCourse(user, course) {
  return user.role === 'admin' || (user.role === 'teacher' && course.teacher_id === user.id);
}

async function canAccessCourse(user, course) {
  if (user.role === 'admin' || canManageCourse(user, course)) {
    return true;
  }

  if (user.role === 'student') {
    return studentIsEnrolled(user.id, course.id);
  }

  return false;
}

async function insertMaterials(lessonId, files = []) {
  for (const file of files) {
    const uploaded = await uploadMaterialFile(file);
    await lessonMaterialRepository.insertMaterial({
      lesson_id: lessonId,
      file_name: file.originalname,
      file_path: uploaded.file_url,
      file_type: uploaded.file_type
    });
  }
}

async function createLesson(req, res) {
  try {
    const { course_id, title, content, lesson_order } = req.body;
    if (!course_id || !title) {
      return res.status(400).json({ message: 'Course and lesson title are required.' });
    }

    const course = await courseRepository.findCourseById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only add lessons to your own courses.' });
    }

    const lesson = await lessonRepository.createLesson({
      course_id,
      title,
      content: content || '',
      lesson_order: lesson_order || 1
    });

    await insertMaterials(lesson.id, req.files);
    return res.status(201).json({ message: 'Lesson created.', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create lesson.', error: error.message });
  }
}

async function getLessonsByCourse(req, res) {
  try {
    const course = await courseRepository.findCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!(await canAccessCourse(req.user, course))) {
      return res.status(403).json({ message: 'Enroll in this course to view lessons.' });
    }

    const lessons = await lessonRepository.listLessonsByCourse(req.params.courseId);
    for (const lesson of lessons) {
      lesson.materials = await lessonMaterialRepository.listMaterialsByLesson(lesson.id);
    }

    return res.json(lessons);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load lessons.', error: error.message });
  }
}

async function getLessonById(req, res) {
  try {
    const lesson = await lessonRepository.findLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const course = await courseRepository.findCourseById(lesson.course_id);
    if (!(await canAccessCourse(req.user, course))) {
      return res.status(403).json({ message: 'You cannot view this lesson.' });
    }

    lesson.materials = await lessonMaterialRepository.listMaterialsByLesson(lesson.id);
    return res.json(lesson);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load lesson.', error: error.message });
  }
}

async function updateLesson(req, res) {
  try {
    const lesson = await lessonRepository.findLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const course = await courseRepository.findCourseById(lesson.course_id);
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only edit lessons for your own courses.' });
    }

    const { title, content, lesson_order, status } = req.body;
    const updatedLesson = await lessonRepository.updateLesson(req.params.id, {
      title,
      content,
      lesson_order,
      status
    });

    await insertMaterials(req.params.id, req.files);
    return res.json({ message: 'Lesson updated.', lesson: updatedLesson });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update lesson.', error: error.message });
  }
}

async function deleteLesson(req, res) {
  try {
    const lesson = await lessonRepository.findLessonById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const course = await courseRepository.findCourseById(lesson.course_id);
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only delete lessons for your own courses.' });
    }

    await lessonRepository.deactivateLesson(req.params.id);
    return res.json({ message: 'Lesson deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete lesson.', error: error.message });
  }
}

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  studentIsEnrolled,
  canAccessCourse
};

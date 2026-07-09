const courseRepository = require('../repositories/courseRepository');
const enrollmentRepository = require('../repositories/enrollmentRepository');

async function enrollInCourse(req, res) {
  try {
    const course = await courseRepository.findCourseById(req.params.courseId);
    if (!course || course.status !== 'active') {
      return res.status(404).json({ message: 'Active course not found.' });
    }

    const existing = await enrollmentRepository.getEnrollment(req.user.id, req.params.courseId);
    if (existing) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }

    const enrollment = await enrollmentRepository.createEnrollment(req.user.id, req.params.courseId);
    return res.status(201).json({ message: 'Enrollment successful.', enrollment_id: enrollment.id });
  } catch (error) {
    return res.status(500).json({ message: 'Could not enroll in course.', error: error.message });
  }
}

async function getMyEnrolledCourses(req, res) {
  try {
    const courses = await enrollmentRepository.listStudentEnrollments(req.user.id);
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load enrolled courses.', error: error.message });
  }
}

async function getStudentsInCourse(req, res) {
  try {
    const course = await courseRepository.findCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (req.user.role !== 'admin' && !(req.user.role === 'teacher' && course.teacher_id === req.user.id)) {
      return res.status(403).json({ message: 'You can only view students in your own courses.' });
    }

    const students = await enrollmentRepository.listCourseStudents(req.params.courseId);
    return res.json(students);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load enrolled students.', error: error.message });
  }
}

async function updateProgress(req, res) {
  try {
    const { progress_percentage } = req.body;
    const progress = Number(progress_percentage);

    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be a number from 0 to 100.' });
    }

    const enrollment = await enrollmentRepository.getEnrollmentById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    const course = await courseRepository.findCourseById(enrollment.course_id);
    const isStudentOwner = req.user.role === 'student' && enrollment.student_id === req.user.id;
    const isTeacherOwner = req.user.role === 'teacher' && course.teacher_id === req.user.id;

    if (!isStudentOwner && !isTeacherOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot update this progress record.' });
    }

    await enrollmentRepository.updateProgress(req.params.id, progress);
    return res.json({ message: 'Progress updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update progress.', error: error.message });
  }
}

module.exports = {
  enrollInCourse,
  getMyEnrolledCourses,
  getStudentsInCourse,
  updateProgress
};

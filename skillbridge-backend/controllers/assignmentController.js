const assignmentRepository = require('../repositories/assignmentRepository');
const courseRepository = require('../repositories/courseRepository');
const { uploadMaterialFile } = require('../services/storageService');
const { canAccessCourse } = require('./lessonController');

async function findAssignment(id) {
  return assignmentRepository.findAssignment(id);
}

async function createAssignment(req, res) {
  try {
    const { course_id, title, instructions, due_date, total_marks } = req.body;
    if (!course_id || !title || !instructions) {
      return res.status(400).json({ message: 'Course, title, and instructions are required.' });
    }

    const course = await courseRepository.findCourseById(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canAccessCourse(req.user, course) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create assignments for your own courses.' });
    }

    const attachment = req.file ? await uploadMaterialFile(req.file) : null;
    const assignment = await assignmentRepository.createAssignment({
      course_id,
      teacher_id: req.user.id,
      title,
      instructions,
      due_date: due_date || null,
      total_marks: total_marks || 100,
      attachment: attachment ? attachment.file_url : null
    });

    return res.status(201).json({ message: 'Assignment created.', assignment });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create assignment.', error: error.message });
  }
}

async function getAssignmentsByCourse(req, res) {
  try {
    const course = await courseRepository.findCourseById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!(await canAccessCourse(req.user, course))) {
      return res.status(403).json({ message: 'You cannot view assignments for this course.' });
    }

    const assignments = await assignmentRepository.listAssignmentsByCourse(req.params.courseId);
    return res.json(assignments);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load assignments.', error: error.message });
  }
}

async function getAssignmentById(req, res) {
  try {
    const assignment = await findAssignment(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const course = await courseRepository.findCourseById(assignment.course_id);
    if (!(await canAccessCourse(req.user, course))) {
      return res.status(403).json({ message: 'You cannot view this assignment.' });
    }

    return res.json(assignment);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load assignment.', error: error.message });
  }
}

async function updateAssignment(req, res) {
  try {
    const assignment = await findAssignment(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const course = await courseRepository.findCourseById(assignment.course_id);
    if (!canAccessCourse(req.user, course) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit assignments for your own courses.' });
    }

    const { title, instructions, due_date, total_marks, status } = req.body;
    const attachment = req.file ? await uploadMaterialFile(req.file) : null;
    const updatedAssignment = await assignmentRepository.updateAssignment(req.params.id, {
      title,
      instructions,
      due_date,
      total_marks,
      status,
      attachment: attachment ? attachment.file_url : null
    });

    return res.json({ message: 'Assignment updated.', assignment: updatedAssignment });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update assignment.', error: error.message });
  }
}

async function deleteAssignment(req, res) {
  try {
    const assignment = await findAssignment(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const course = await courseRepository.findCourseById(assignment.course_id);
    if (!canAccessCourse(req.user, course) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete assignments for your own courses.' });
    }

    await assignmentRepository.deactivateAssignment(req.params.id);
    return res.json({ message: 'Assignment deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete assignment.', error: error.message });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  findAssignment
};

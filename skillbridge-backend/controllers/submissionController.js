const submissionRepository = require('../repositories/submissionRepository');
const assignmentRepository = require('../repositories/assignmentRepository');
const courseRepository = require('../repositories/courseRepository');
const { uploadSubmissionFile } = require('../services/storageService');
const { studentIsEnrolled } = require('./lessonController');

async function findAssignment(id) {
  return assignmentRepository.findAssignment(id);
}

async function submitAssignment(req, res) {
  try {
    const assignment = await findAssignment(req.params.assignmentId);
    if (!assignment || assignment.status !== 'active') {
      return res.status(404).json({ message: 'Active assignment not found.' });
    }

    const enrolled = await studentIsEnrolled(req.user.id, assignment.course_id);
    if (!enrolled) {
      return res.status(403).json({ message: 'Enroll in this course before submitting assignments.' });
    }

    const fileUpload = req.file ? await uploadSubmissionFile(req.file) : null;
    const existing = await submissionRepository.getSubmissionByAssignmentAndStudent(req.params.assignmentId, req.user.id);

    if (existing) {
      const updated = await submissionRepository.updateSubmission(existing.id, {
        file_path: fileUpload ? fileUpload.file_url : null,
        comments: req.body.comments || null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        graded_at: null
      });
      return res.json({ message: 'Submission updated.', submission_id: updated.id });
    }

    const submission = await submissionRepository.createSubmission({
      assignment_id: req.params.assignmentId,
      student_id: req.user.id,
      file_path: fileUpload ? fileUpload.file_url : null,
      comments: req.body.comments || null
    });

    return res.status(201).json({ message: 'Assignment submitted.', submission_id: submission.id });
  } catch (error) {
    return res.status(500).json({ message: 'Could not submit assignment.', error: error.message });
  }
}

async function getMySubmissions(req, res) {
  try {
    const submissions = await submissionRepository.listSubmissionsByStudent(req.user.id);
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load submissions.', error: error.message });
  }
}

async function getSubmissionsForAssignment(req, res) {
  try {
    const assignment = await findAssignment(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const course = await courseRepository.findCourseById(assignment.course_id);
    if (!course || !(course.teacher_id === req.user.id || req.user.role === 'admin')) {
      return res.status(403).json({ message: 'You can only view submissions for your own courses.' });
    }

    const submissions = await submissionRepository.listSubmissionsByAssignment(req.params.assignmentId);
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load assignment submissions.', error: error.message });
  }
}

async function gradeSubmission(req, res) {
  try {
    const { marks_awarded, feedback } = req.body;
    if (marks_awarded === undefined) {
      return res.status(400).json({ message: 'Marks awarded is required.' });
    }

    const submission = await submissionRepository.getSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    const assignment = await findAssignment(submission.assignment_id);
    const course = await courseRepository.findCourseById(assignment.course_id);
    if (!course || !(course.teacher_id === req.user.id || req.user.role === 'admin')) {
      return res.status(403).json({ message: 'You can only grade submissions for your own courses.' });
    }

    await submissionRepository.updateSubmission(req.params.id, {
      marks_awarded,
      feedback: feedback || null,
      status: 'graded',
      graded_at: new Date().toISOString()
    });

    return res.json({ message: 'Submission graded.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not grade submission.', error: error.message });
  }
}

module.exports = {
  submitAssignment,
  getMySubmissions,
  getSubmissionsForAssignment,
  gradeSubmission
};

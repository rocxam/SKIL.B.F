import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAssignmentsByCourse } from '../../services/assignmentService';
import { getTeacherCourses } from '../../services/courseService';
import { getAssignmentSubmissions, gradeSubmission } from '../../services/submissionService';
import formatDate from '../../utils/formatDate';

export default function ViewSubmissions() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherCourses()
      .then((response) => setCourses(response.data))
      .finally(() => setLoading(false));
  }, []);

  async function loadAssignments(courseId) {
    setSelectedCourse(courseId);
    setSelectedAssignment('');
    setSubmissions([]);
    if (courseId) {
      const response = await getAssignmentsByCourse(courseId);
      setAssignments(response.data);
    }
  }

  async function loadSubmissions(assignmentId) {
    setSelectedAssignment(assignmentId);
    if (assignmentId) {
      const response = await getAssignmentSubmissions(assignmentId);
      setSubmissions(response.data);
    }
  }

  async function handleGrade(submission) {
    const marks = window.prompt('Marks awarded:', submission.marks_awarded || '');
    if (marks === null) return;
    const feedback = window.prompt('Feedback:', submission.feedback || '') || '';
    await gradeSubmission(submission.id, { marks_awarded: marks, feedback });
    setMessage('Submission graded.');
    loadSubmissions(selectedAssignment);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">View submissions</h1>
      <AlertMessage type="success" message={message} />
      <div className="content-panel mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <select className="form-select" value={selectedCourse} onChange={(e) => loadAssignments(e.target.value)}>
              <option value="">Choose course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <select className="form-select" value={selectedAssignment} onChange={(e) => loadSubmissions(e.target.value)}>
              <option value="">Choose assignment</option>
              {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Student</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.student_name}<br /><span className="text-muted small">{submission.student_email}</span></td>
                <td>{formatDate(submission.submitted_at)}</td>
                <td>{submission.status}</td>
                <td>{submission.marks_awarded ?? 'Not graded'}</td>
                <td><button className="btn btn-outline-primary btn-sm" onClick={() => handleGrade(submission)}>Grade</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

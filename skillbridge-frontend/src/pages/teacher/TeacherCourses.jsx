import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { deleteCourse, getTeacherCourses } from '../../services/courseService';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadCourses() {
    const response = await getTeacherCourses();
    setCourses(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Deactivate this course? Students will no longer see it as active.')) return;
    await deleteCourse(id);
    setMessage('Course deactivated.');
    loadCourses();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My courses</h1>
        <Link className="btn btn-primary" to="/teacher/courses/create">Create course</Link>
      </div>
      <AlertMessage type="success" message={message} />
      <div className="row g-3">
        {courses.map((course) => (
          <div className="col-lg-6" key={course.id}>
            <CourseCard course={course} showManageLink />
            <div className="d-flex gap-2 mt-2">
              <Link className="btn btn-outline-primary btn-sm" to={`/teacher/courses/${course.id}/edit`}>Edit</Link>
              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(course.id)}>Deactivate</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

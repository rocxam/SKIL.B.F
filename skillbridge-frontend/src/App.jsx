import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Poster from './pages/public/Poster';
import BrowseCourses from './pages/public/BrowseCourses';
import CourseDetails from './pages/public/CourseDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CreateCourse from './pages/teacher/CreateCourse';
import EditCourse from './pages/teacher/EditCourse';
import ManageLessons from './pages/teacher/ManageLessons';
import CreateLesson from './pages/teacher/CreateLesson';
import CreateAssignment from './pages/teacher/CreateAssignment';
import ViewSubmissions from './pages/teacher/ViewSubmissions';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourses from './pages/student/MyCourses';
import CourseLearning from './pages/student/CourseLearning';
import Assignments from './pages/student/Assignments';
import SubmitAssignment from './pages/student/SubmitAssignment';
import MyGrades from './pages/student/MyGrades';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import ManageCategories from './pages/admin/ManageCategories';

export default function App() {
  return (
    <BrowserRouter>
      {/* React Router maps URLs to pages. Nested routes let dashboards share one layout. */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/poster" element={<Poster />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<DashboardLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="courses/create" element={<CreateCourse />} />
              <Route path="courses/:id/edit" element={<EditCourse />} />
              <Route path="courses/:id/lessons" element={<ManageLessons />} />
              <Route path="courses/:id/lessons/create" element={<CreateLesson />} />
              <Route path="assignments/create" element={<CreateAssignment />} />
              <Route path="submissions" element={<ViewSubmissions />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="courses/:id/learn" element={<CourseLearning />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="assignments/:id/submit" element={<SubmitAssignment />} />
              <Route path="grades" element={<MyGrades />} />
            </Route>
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="categories" element={<ManageCategories />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

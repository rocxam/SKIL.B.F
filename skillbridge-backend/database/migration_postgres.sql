-- Postgres / Supabase migration for SkillBridge
BEGIN;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'student',
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS course_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER REFERENCES course_categories(id),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  level VARCHAR(50) DEFAULT 'Beginner',
  duration VARCHAR(50),
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  content TEXT,
  lesson_order INTEGER DEFAULT 1,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lesson materials
CREATE TABLE IF NOT EXISTS lesson_materials (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(160) NOT NULL,
  instructions TEXT NOT NULL,
  due_date DATE,
  total_marks INTEGER DEFAULT 100,
  attachment TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id),
  file_path TEXT,
  comments TEXT,
  marks_awarded NUMERIC(6,2),
  feedback TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (assignment_id, student_id)
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(160) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);

COMMIT;

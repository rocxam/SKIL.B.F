-- Seed data for PostgreSQL / Supabase
-- IMPORTANT: Review password hashes and replace with secure values in production.

-- Use a bcrypt hash for the default password (Password123!)
-- Replace the hash below if you choose a different default password.

INSERT INTO users (id, full_name, email, phone, password, role)
VALUES
(1, 'Admin User', 'admin@skillbridge.test', '+256700000001', '$2b$10$BfToyXvaxlWouNXenDzBf.Usq8zWDvZx0xLYYtUKwT3LO.N56crXy', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Add more users (inserted with ON CONFLICT DO NOTHING to be idempotent)
INSERT INTO users (id, full_name, email, phone, password, role) VALUES
(2, 'Grace Namatovu', 'grace.teacher@skillbridge.test', '+256700000002', '$2b$10$BfToyXvaxlWouNXenDzBf.Usq8zWDvZx0xLYYtUKwT3LO.N56crXy', 'teacher')
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO course_categories (id, name, description) VALUES
(1, 'Web Development', 'Frontend and backend web application development.')
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO courses (id, teacher_id, category_id, title, description, level, duration) VALUES
(1, 2, 1, 'Full-Stack Web Development with JavaScript', 'Build complete web applications with React, Express, and MariaDB.', 'Beginner', '10 weeks')
ON CONFLICT (id) DO NOTHING;

-- Lessons
INSERT INTO lessons (id, course_id, title, content, lesson_order) VALUES
(1, 1, 'How the Web Works', 'Clients send HTTP requests to servers, and servers return responses.', 1)
ON CONFLICT (id) DO NOTHING;

-- Assignments
INSERT INTO assignments (id, course_id, teacher_id, title, instructions, due_date, total_marks) VALUES
(1, 1, 2, 'Build a Course Card Component', 'Create a reusable React component that displays course details.', '2026-07-15', 100)
ON CONFLICT (id) DO NOTHING;

-- Enrollments
INSERT INTO enrollments (id, student_id, course_id, progress_percentage) VALUES
(1, 5, 1, 40)
ON CONFLICT (id) DO NOTHING;

-- Submissions
INSERT INTO submissions (assignment_id, student_id, file_path, comments, marks_awarded, feedback, status, graded_at) VALUES
(1, 5, 'materials/sample-course-card.pdf', 'Submitted my first version.', 82, 'Good structure. Improve spacing on small screens.', 'graded', now())
ON CONFLICT DO NOTHING;

-- Note: This seed file is minimal; extend as needed.

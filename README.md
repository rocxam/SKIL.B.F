# SkillBridge

SkillBridge is a full-stack eLearning project that demonstrates a complete course management experience. It includes a React frontend with role-based dashboards and an Express backend with MySQL/MariaDB persistence, JWT authentication, file uploads, and administrative controls.

## Project Overview

SkillBridge was built as a learning platform prototype for students, teachers, and administrators. It addresses the need for a practical demo application that includes:

- secure user registration and login
- student course enrollment and learning workflows
- teacher course creation, lesson authoring, assignment creation, and grading
- admin controls for managing users, courses, and categories
- real database persistence with MySQL/MariaDB and optional SQLite support

The main goal is to provide a real-world full-stack application with clean structure, role-based access, and realistic eLearning features.

## Features

### General
- User registration and login
- JWT-based authentication and protected routes
- Role-based access control for `student`, `teacher`, and `admin`
- Database-backed storage for users, courses, lessons, enrollments, assignments, and submissions
- CORS support for frontend/backend development on separate ports
- File upload support for course materials, cover images, assignment attachments, and submissions

### Student Experience
- Browse available courses
- View course details and categories
- Enroll in courses
- Access lessons and learning content
- Submit assignments for review
- View own grades and submission history

### Teacher Experience
- Create and manage courses
- Upload course cover images and lesson materials
- Add lessons for courses
- Create assignments and attach files
- View and grade student submissions

### Admin Experience
- View platform statistics
- Manage users and update status
- Manage courses and update status
- Manage course categories

## Technologies Used

### Frontend
- React 18
- Vite
- React Router DOM
- Bootstrap 5
- Axios

### Backend
- Node.js
- Express
- mysql2 / MariaDB / MySQL
- SQLite support via `sqlite3`
- JSON Web Tokens (`jsonwebtoken`)
- Password hashing with `bcrypt`
- File uploads using `multer`
- CORS handling with `cors`
- Environment variables with `dotenv`

### Database
- MySQL / MariaDB (primary)
- SQLite (optional fallback via `DB_DRIVER=sqlite`)

## Project Structure

```
README.md
skillbridge-backend/
  .env.example
  package.json
  server.js
  config/db.js
  controllers/
  middleware/
  routes/
  uploads/
  database/
skillbridge-frontend/
  package.json
  index.html
  src/
    App.jsx
    main.jsx
    styles.css
    components/
    context/
    layouts/
    pages/
    services/
```

### Important folders

- `skillbridge-backend/`
  - `server.js` - main Express application entry point
  - `config/db.js` - database connection helper, schema creation, and seeding logic
  - `routes/` - API endpoint definitions for auth, courses, lessons, enrollments, assignments, submissions, users, and admin
  - `controllers/` - request handling and business logic
  - `middleware/` - authentication, authorization, file upload, and request handling helpers
  - `uploads/` - stored file assets for course content and submissions
  - `database/` - schema and sample seed scripts

- `skillbridge-frontend/`
  - `src/App.jsx` - route definitions and app shell
  - `src/main.jsx` - client entry point for Vite
  - `src/styles.css` - application styling
  - `src/components/` - reusable UI components such as Navbar and protected route wrappers
  - `src/context/` - authentication context and user session management
  - `src/pages/` - public pages, student dashboard, teacher pages, and admin pages
  - `src/services/` - Axios API wrappers for auth, courses, enrollments, lessons, and submissions

## Installation and Setup Guide

### Prerequisites

- Node.js 18 or higher
- npm
- MySQL or MariaDB server
- Optional: MySQL client tools such as MySQL Workbench, DBeaver, or CLI

### Clone the repository

```bash
git clone https://github.com/your-username/skillbridge.git
cd SKIL.B.F
```

### Backend setup

```bash
cd skillbridge-backend
npm install
cp .env.example .env
```

Update `.env` with your database credentials and frontend URL. Example:

```env
PORT=5000
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=skillbridge_user
DB_PASSWORD=your_password_here
DB_NAME=skillbridge_db
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
```

### Database setup

Use MySQL or MariaDB to create the database and a dedicated user:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS skillbridge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'skillbridge_user'@'localhost' IDENTIFIED BY 'YourPassword123!'; GRANT ALL PRIVILEGES ON skillbridge_db.* TO 'skillbridge_user'@'localhost'; FLUSH PRIVILEGES;"
```

The backend includes database initialization logic in `config/db.js` that can automatically create the database and tables when using MySQL.

### Frontend setup

```bash
cd ../skillbridge-frontend
npm install
```

### Running locally

Open two terminals.

1. Start the backend:

```bash
cd skillbridge-backend
npm run dev
```

2. Start the frontend:

```bash
cd ../skillbridge-frontend
npm run dev -- --host 127.0.0.1 --port 5174
```

Application URLs:

- Frontend: `http://localhost:5174`
- Backend: `http://localhost:5000`

## Development Process / Implementation Steps

### Initial setup
- Initialized a Node.js Express backend and a separate React/Vite frontend.
- Created a decoupled folder structure so backend and frontend can be developed independently.

### Architecture decisions
- Used JWT authentication for stateless security.
- Separated authenticated routes and role-based routes for `student`, `teacher`, and `admin`.
- Created reusable API service wrappers so frontend components can call backend endpoints consistently.
- Used `mysql2/promise` for MySQL support while preserving optional SQLite fallback.

### Frontend development
- Built public pages for home, courses, about, login, register, and poster summary.
- Created reusable layout shells for public pages and dashboard pages.
- Implemented authentication state management with React context.
- Added protected routes and role-based routing to hide unavailable pages.

### Backend development
- Built REST API routes for auth, users, courses, lessons, enrollments, assignments, submissions, and admin actions.
- Added middleware to protect routes and restrict actions by role.
- Added file upload endpoints for lesson attachments and assignment submissions.
- Added static file serving for uploaded assets.

### Database integration
- Designed tables for users, course categories, courses, lessons, lesson materials, enrollments, assignments, and submissions.
- Added seeded sample data for users and a learning workflow.
- Supported both MySQL/MariaDB and SQLite in the same database abstraction layer.

### Feature implementation
- Auth endpoints: register, login, get current user
- Course endpoints: create, update, delete, list, details, teacher courses
- Lesson endpoints: create, update, delete, list
- Enrollment endpoints: enroll, list student courses, list course students, update progress
- Assignment endpoints: create, update, delete, list by course
- Submission endpoints: submit, list student submissions, list assignment submissions, grade submissions
- Admin endpoints: manage users, courses, categories, and statistics

### Testing and debugging
- Verified login and registration flows with the frontend.
- Checked CORS configuration to allow the React app on `http://localhost:5174`.
- Confirmed backend health with a `/health` endpoint.

### Final improvements
- Added file upload support and static file serving for lesson and assignment assets.
- Added a polished poster page and improved navbar access.

## Configuration

### Important files
- `skillbridge-backend/.env.example` — sample environment variables for database, JWT, and CORS.
- `skillbridge-backend/config/db.js` — database connection setup and schema initialization.
- `skillbridge-frontend/src/services/api.js` — Axios configuration and auth token injection.
- `skillbridge-frontend/src/context/AuthContext.jsx` — global user session and auth state.
- `skillbridge-frontend/src/App.jsx` — React Router route configuration.

### Environment variables

Backend variables:

- `PORT` — backend server port (default 5000)
- `DB_DRIVER` — `mysql` or `sqlite`
- `DB_HOST` — MySQL host
- `DB_PORT` — MySQL port
- `DB_USER` — MySQL username
- `DB_PASSWORD` — MySQL password
- `DB_NAME` — database name
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token lifetime
- `FRONTEND_URL` — frontend origin for CORS
- `CORS_ORIGINS` — allowed frontend origins

Do not commit secrets or real passwords to source control.

## Usage Guide

### Public user flow
1. Open the frontend at `http://localhost:5174`.
2. Review featured courses on the homepage.
3. Browse courses and read details.
4. Register or log in to enroll and access course content.

### Student workflow
- Enroll in courses.
- Access lessons and course learning pages.
- Submit assignments using file upload.
- View grades and assignment status.

### Teacher workflow
- Log in as a teacher.
- Create and manage courses.
- Add lessons and upload lesson materials.
- Create assignments and attach files.
- View and grade student submissions.

### Admin workflow
- Log in as an admin.
- View platform statistics and user lists.
- Manage courses and update course status.
- Manage categories and update user status.

## Future Improvements

Potential enhancements include:

- richer course search and filtering
- real-time notifications and activity updates
- improved assignment review workflow with comments
- better file preview and download UX
- production-ready deployment with HTTPS and containerization
- mobile-friendly dashboard refinements

## Challenges and Solutions

### CORS and frontend/backend separation
- Issue: frontend and backend run on different ports.
- Solution: configured `cors` middleware and allowed origins in `.env` to support development traffic.

### Role-based access
- Issue: teachers, students, and admins require different permissions.
- Solution: added authorization middleware that validates the JWT and checks user roles before sensitive actions.

### Database persistence
- Issue: backend needed to support database creation and initial seeding.
- Solution: `config/db.js` initializes schema and supports both MySQL and SQLite for local development.

## Deployment Guide

### Backend deployment
- Ensure Node.js is installed on the server.
- Set environment variables in production securely.
- Install dependencies with `npm install`.
- Start the server with `npm start` or use a process manager like PM2.
- Configure the database credentials and make sure MySQL/MariaDB is accessible.

### Frontend deployment
- Build the app with:

```bash
cd skillbridge-frontend
npm run build
```

- Serve the generated `dist` folder using a static server or deploy to platforms like Vercel, Netlify, or a static hosting service.
- Update `VITE_API_URL` or backend URL if necessary for production.

## Credits / Contributors

- Project folder: `skillbridge-backend` and `skillbridge-frontend`
- Backend developer: Node.js + Express + MySQL API
- Frontend developer: React + Vite + Bootstrap UI

## License

This project is licensed under the MIT License.


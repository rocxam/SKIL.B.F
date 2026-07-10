const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

let corsMiddleware;
if (process.env.NODE_ENV === 'production') {
  // In production allow the request origin dynamically so same-origin requests
  // from the rendered site are accepted even when FRONTEND_URL is not set.
  corsMiddleware = cors({ origin: true, credentials: true });
} else {
  const corsOptions = {
    origin(origin, callback) {
      // Browsers send an Origin header. Non-browser tools may omit it.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  };

  corsMiddleware = cors(corsOptions);
}

app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use(express.static(uploadsPath));

const frontendDistPath = path.resolve(__dirname, '../skillbridge-frontend/dist');
const frontendIndexFile = path.join(frontendDistPath, 'index.html');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath, {
    index: false,
    maxAge: '1d'
  }));
}

app.get('/health', async (req, res) => {
  try {
    await db.testConnection();
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || 'Request failed.' });
  }
  return next();
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return res.status(404).json({ message: 'Not found.' });
  }

  if (fs.existsSync(frontendIndexFile)) {
    return res.sendFile(frontendIndexFile);
  }

  return res.json({ message: 'SkillBridge API is running.' });
});

async function startServer() {
  try {
    await db.initialize();
    await db.testConnection();
    console.log('Database connection is available.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`SkillBridge backend running on port ${PORT}`);
  });
}

startServer();

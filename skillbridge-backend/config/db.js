const path = require('path');
const fs = require('fs');
require('dotenv').config();

const driver = (process.env.DB_DRIVER || 'mysql').toLowerCase();
const useSqlite = driver === 'sqlite';

let connection;
let sqlite3;

if (useSqlite) {
  const dbPath = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'skillbridge.sqlite');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  sqlite3 = require('sqlite3').verbose();
  connection = new sqlite3.Database(dbPath);
} else {
  const mysql = require('mysql2/promise');
  connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'skillbridge_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z'
  });
}

function run(sql, params = []) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      connection.run(sql, params, function (error) {
        if (error) {
          reject(error);
          return;
        }
        resolve({ insertId: this.lastID, lastID: this.lastID, changes: this.changes });
      });
    });
  }

  return connection.execute(sql, params).then(([result]) => result);
}

function get(sql, params = []) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      connection.get(sql, params, (error, row) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(row);
      });
    });
  }

  return connection.execute(sql, params).then(([rows]) => rows[0] || null);
}

function all(sql, params = []) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      connection.all(sql, params, (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows);
      });
    });
  }

  return connection.execute(sql, params).then(([rows]) => rows);
}

async function initialize() {
  await run('PRAGMA foreign_keys = ON');
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS course_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      category_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT DEFAULT 'Beginner',
      duration TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      cover_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES course_categories(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      lesson_order INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS lesson_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      progress_percentage REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      enrolled_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id),
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      due_date TEXT,
      total_marks INTEGER DEFAULT 100,
      attachment TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      file_path TEXT,
      comments TEXT,
      marks_awarded REAL,
      feedback TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
      graded_at TEXT,
      UNIQUE(assignment_id, student_id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  const count = await get('SELECT COUNT(*) AS count FROM users');
  if (count.count === 0) {
    await run(
      `INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      ['Admin User', 'admin@skillbridge.test', '$2b$10$kK2G40m9R2f0p2Vb0je0M.eHULGfX2mDK7LeMWsMhk7g4I5fKMYC2', 'admin', 'active']
    );
  }
}

async function query(sql, params = []) {
  const normalized = sql.trim();
  if (/^\s*(select|with)\b/i.test(normalized)) {
    return all(sql, params);
  }
  return run(sql, params);
}

async function testConnection() {
  if (useSqlite) {
    return get('SELECT 1 AS ok');
  }
  return connection.execute('SELECT 1 AS ok');
}

if (useSqlite) {
  initialize().catch((error) => {
    console.error('Database initialization failed:', error.message);
  });
}

module.exports = {
  connection,
  query,
  testConnection,
  run,
  get,
  all
};

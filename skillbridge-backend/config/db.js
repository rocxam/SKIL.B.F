  const path = require('path');
  const fs = require('fs');
  require('dotenv').config();
  const bcrypt = require('bcrypt');

  const driver = (process.env.DB_DRIVER || 'sqlite').toLowerCase();
  const useSqlite = driver === 'sqlite';

  let connection;
  let sqlite3;

  function parseDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return null;
    const match = databaseUrl.match(/^(mysql):\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/(.+)$/);
    if (!match) return null;
    return {
      driver: match[1],
      user: match[2],
      password: match[3],
      host: match[4],
      port: match[5] ? Number(match[5]) : 3306,
      database: match[6]
    };
  }

  function getMySqlConfig() {
    const urlConfig = parseDatabaseUrl();
    return {
      host: process.env.DB_HOST || urlConfig?.host || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : urlConfig?.port || 3306,
      user: process.env.DB_USER || urlConfig?.user || 'root',
      password: process.env.DB_PASSWORD || urlConfig?.password || '',
      database: process.env.DB_NAME || urlConfig?.database || 'skillbridge_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      multipleStatements: true,
      charset: 'utf8mb4'
    };
  }

  async function initSqliteConnection() {
    const dbPath = process.env.DB_FILE || path.join(__dirname, '..', 'data', 'skillbridge.sqlite');
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    sqlite3 = require('sqlite3').verbose();
    connection = new sqlite3.Database(dbPath);
    return connection;
  }

  async function initMysqlConnection() {
    const mysql = require('mysql2/promise');
    const config = getMySqlConfig();
    const adminConfig = { ...config };
    delete adminConfig.database;

    const adminPool = mysql.createPool(adminConfig);
    await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await adminPool.end();

    connection = mysql.createPool(config);
    return connection;
  }

  async function initConnection() {
    if (connection) return connection;
    if (useSqlite) {
      return initSqliteConnection();
    }
    return initMysqlConnection();
  }

  async function run(sql, params = []) {
    await initConnection();

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

  async function get(sql, params = []) {
    await initConnection();

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

  async function all(sql, params = []) {
    await initConnection();

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

  function buildColumnTypes() {
    if (useSqlite) {
      return {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        varchar: 'TEXT',
        datetime: 'TEXT DEFAULT CURRENT_TIMESTAMP',
        text: 'TEXT'
      };
    }

    return {
      id: 'INT AUTO_INCREMENT PRIMARY KEY',
      varchar: 'VARCHAR(255)',
      datetime: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      text: 'TEXT'
    };
  }

  async function initialize() {
    await initConnection();

    const types = buildColumnTypes();

    if (useSqlite) {
      await run('PRAGMA foreign_keys = ON');
    }

    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id ${types.id},
        full_name ${types.varchar} NOT NULL,
        email ${types.varchar} NOT NULL UNIQUE,
        phone ${types.varchar},
        password ${types.varchar} NOT NULL,
        role ${types.varchar} NOT NULL DEFAULT 'student',
        status ${types.varchar} NOT NULL DEFAULT 'active',
        created_at ${types.datetime},
        updated_at ${types.datetime}
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS course_categories (
        id ${types.id},
        name ${types.varchar} NOT NULL UNIQUE,
        description ${types.text},
        status ${types.varchar} NOT NULL DEFAULT 'active',
        created_at ${types.datetime},
        updated_at ${types.datetime}
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS courses (
        id ${types.id},
        teacher_id INT NOT NULL,
        category_id INT,
        title ${types.varchar} NOT NULL,
        description ${types.text} NOT NULL,
        level ${types.varchar} DEFAULT 'Beginner',
        duration ${types.varchar},
        status ${types.varchar} NOT NULL DEFAULT 'active',
        cover_image ${types.varchar},
        created_at ${types.datetime},
        updated_at ${types.datetime},
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES course_categories(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS lessons (
        id ${types.id},
        course_id INT NOT NULL,
        title ${types.varchar} NOT NULL,
        content ${types.text},
        lesson_order INT DEFAULT 1,
        status ${types.varchar} NOT NULL DEFAULT 'active',
        created_at ${types.datetime},
        updated_at ${types.datetime},
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS lesson_materials (
        id ${types.id},
        lesson_id INT NOT NULL,
        file_name ${types.varchar} NOT NULL,
        file_path ${types.varchar} NOT NULL,
        file_type ${types.varchar},
        uploaded_at ${types.datetime},
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id ${types.id},
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        progress_percentage REAL DEFAULT 0,
        status ${types.varchar} NOT NULL DEFAULT 'active',
        enrolled_at ${types.datetime},
        updated_at ${types.datetime},
        UNIQUE(student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id ${types.id},
        course_id INT NOT NULL,
        teacher_id INT NOT NULL,
        title ${types.varchar} NOT NULL,
        instructions ${types.text} NOT NULL,
        due_date ${types.varchar},
        total_marks INT DEFAULT 100,
        attachment ${types.varchar},
        status ${types.varchar} NOT NULL DEFAULT 'active',
        created_at ${types.datetime},
        updated_at ${types.datetime},
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id ${types.id},
        assignment_id INT NOT NULL,
        student_id INT NOT NULL,
        file_path ${types.varchar},
        comments ${types.text},
        marks_awarded REAL,
        feedback ${types.text},
        status ${types.varchar} NOT NULL DEFAULT 'submitted',
        submitted_at ${types.datetime},
        graded_at ${types.varchar},
        UNIQUE(assignment_id, student_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id ${types.id},
        course_id INT NOT NULL,
        title ${types.varchar} NOT NULL,
        message ${types.text} NOT NULL,
        created_at ${types.datetime},
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id ${types.id},
        user_id INT,
        action ${types.varchar} NOT NULL,
        details ${types.text},
        created_at ${types.datetime},
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const userCount = await get('SELECT COUNT(*) AS count FROM users');
    if (userCount.count === 0) {
      const adminPassword = await bcrypt.hash('Admin123!', 10);
      const teacherPassword = await bcrypt.hash('Teacher123!', 10);
      const studentPassword = await bcrypt.hash('Password123!', 10);

      await run(
        'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@skillbridge.test', adminPassword, 'admin', 'active']
      );

      await run(
        'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Grace Teacher', 'grace.teacher@skillbridge.test', teacherPassword, 'teacher', 'active']
      );

      await run(
        'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Brian Student', 'brian.student@skillbridge.test', studentPassword, 'student', 'active']
      );

      await run(
        'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        ['Claire Student', 'claire.student@skillbridge.test', studentPassword, 'student', 'active']
      );
    }

    const categoryCount = await get('SELECT COUNT(*) AS count FROM course_categories');
    if (categoryCount.count === 0) {
      const categories = [
        { name: 'Web Development', description: 'Build modern websites and web apps.' },
        { name: 'Data Science', description: 'Analyze data and build predictive models.' },
        { name: 'Cybersecurity', description: 'Protect systems and data from attacks.' },
        { name: 'Design', description: 'Learn UI/UX, product design, and creative tools.' },
        { name: 'Cloud Computing', description: 'Use cloud platforms and architecture patterns.' },
        { name: 'Business & Leadership', description: 'Grow leadership and project management skills.' }
      ];

      for (const category of categories) {
        await run(
          'INSERT INTO course_categories (name, description, status) VALUES (?, ?, ?)',
          [category.name, category.description, 'active']
        );
      }
    }

    const courseCount = await get('SELECT COUNT(*) AS count FROM courses');
    if (courseCount.count === 0) {
      let teacher = await get('SELECT id FROM users WHERE email = ?', ['grace.teacher@skillbridge.test']);
      if (!teacher) {
        teacher = await get('SELECT id FROM users WHERE role = ? LIMIT 1', ['teacher']);
      }

      const categories = await all('SELECT id, name FROM course_categories');
      const categoryMap = categories.reduce((map, cat) => {
        map[cat.name] = cat.id;
        return map;
      }, {});

      const sampleCourses = [
        {
          title: 'React for Beginners',
          description: 'Learn component-based UI development using React and modern JavaScript.',
          category: 'Web Development',
          level: 'Beginner',
          duration: '8 weeks'
        },
        {
          title: 'Advanced Node.js APIs',
          description: 'Build scalable RESTful APIs using Node.js, Express, and MySQL.',
          category: 'Web Development',
          level: 'Advanced',
          duration: '10 weeks'
        },
        {
          title: 'Python Data Analysis',
          description: 'Use pandas, NumPy, and visualization libraries to analyze real datasets.',
          category: 'Data Science',
          level: 'Intermediate',
          duration: '7 weeks'
        },
        {
          title: 'Machine Learning Fundamentals',
          description: 'Understand supervised and unsupervised learning with practical examples.',
          category: 'Data Science',
          level: 'Beginner',
          duration: '9 weeks'
        },
        {
          title: 'Cloud Infrastructure with AWS',
          description: 'Deploy and manage cloud infrastructure using AWS services.',
          category: 'Cloud Computing',
          level: 'Intermediate',
          duration: '8 weeks'
        },
        {
          title: 'Introduction to Cybersecurity',
          description: 'Learn security fundamentals to protect networks, applications, and data.',
          category: 'Cybersecurity',
          level: 'Beginner',
          duration: '6 weeks'
        },
        {
          title: 'Ethical Hacking Essentials',
          description: 'Perform vulnerability assessments and penetration testing in a safe environment.',
          category: 'Cybersecurity',
          level: 'Advanced',
          duration: '10 weeks'
        },
        {
          title: 'UI/UX Design Basics',
          description: 'Create user-friendly interfaces and prototypes with design best practices.',
          category: 'Design',
          level: 'Beginner',
          duration: '5 weeks'
        },
        {
          title: 'Design Systems for Products',
          description: 'Build scalable design systems that improve team collaboration.',
          category: 'Design',
          level: 'Intermediate',
          duration: '7 weeks'
        },
        {
          title: 'Project Management Essentials',
          description: 'Master Agile, Scrum, and stakeholder communication for project success.',
          category: 'Business & Leadership',
          level: 'Beginner',
          duration: '8 weeks'
        },
        {
          title: 'Leadership Skills for Managers',
          description: 'Develop leadership habits to guide teams and improve performance.',
          category: 'Business & Leadership',
          level: 'Intermediate',
          duration: '6 weeks'
        },
        {
          title: 'DevOps Practices',
          description: 'Automate deployments and monitoring with CI/CD and container tooling.',
          category: 'Cloud Computing',
          level: 'Intermediate',
          duration: '9 weeks'
        },
        {
          title: 'Full-Stack Web Development',
          description: 'Build production-ready applications using modern frontend and backend tools.',
          category: 'Web Development',
          level: 'Advanced',
          duration: '12 weeks'
        },
        {
          title: 'Data Visualization with Tableau',
          description: 'Create dashboards and visual stories from real business data.',
          category: 'Data Science',
          level: 'Intermediate',
          duration: '6 weeks'
        },
        {
          title: 'Secure Cloud Architecture',
          description: 'Design secure cloud deployments that follow industry best practices.',
          category: 'Cloud Computing',
          level: 'Advanced',
          duration: '10 weeks'
        }
      ];

      for (const course of sampleCourses) {
        await run(
          `INSERT INTO courses (teacher_id, category_id, title, description, level, duration, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            teacher.id,
            categoryMap[course.category] || null,
            course.title,
            course.description,
            course.level,
            course.duration,
            'active'
          ]
        );
      }
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
    await initConnection();
    if (useSqlite) {
      return get('SELECT 1 AS ok');
    }
    return connection.execute('SELECT 1 AS ok');
  }

  module.exports = {
    connection,
    query,
    initialize,
    testConnection,
    run,
    get,
    all
  };

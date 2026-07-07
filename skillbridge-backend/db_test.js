const db = require('./config/db');

async function run() {
  try {
    const users = await db.query('SELECT id, email, password, full_name, role, status FROM users LIMIT 5');
    console.log(users);
  } catch (error) {
    console.error('DB ERROR', error);
    console.error(error.stack);
  } finally {
    process.exit();
  }
}

run();

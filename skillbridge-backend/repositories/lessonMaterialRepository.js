const db = require('../config/db');

async function insertMaterial({ lesson_id, file_name, file_path, file_type }) {
  const result = await db.query(
    `INSERT INTO lesson_materials (lesson_id, file_name, file_path, file_type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [lesson_id, file_name, file_path, file_type]
  );
  return result.rows[0];
}

async function listMaterialsByLesson(lessonId) {
  const result = await db.query(
    'SELECT * FROM lesson_materials WHERE lesson_id = $1',
    [lessonId]
  );
  return result.rows;
}

module.exports = {
  insertMaterial,
  listMaterialsByLesson
};

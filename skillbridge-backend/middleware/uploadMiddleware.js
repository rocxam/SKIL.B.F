const multer = require('multer');

const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.gif', '.txt'];

function fileFilter(req, file, cb) {
  const extension = file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase() : '';
  if (!allowedExtensions.includes(extension)) {
    return cb(new Error('Unsupported file type.'));
  }

  return cb(null, true);
}

const memoryStorage = multer.memoryStorage();

const uploadMaterial = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadSubmission = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
  uploadMaterial,
  uploadSubmission
};

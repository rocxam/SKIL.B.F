const supabase = require('../config/supabaseClient');

const materialsBucket = process.env.SUPABASE_STORAGE_BUCKET_MATERIALS || 'materials';
const submissionsBucket = process.env.SUPABASE_STORAGE_BUCKET_SUBMISSIONS || 'submissions';

function sanitizeFileName(fileName) {
  return fileName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();
}

function buildStoragePath(folder, originalname) {
  const safeName = sanitizeFileName(originalname);
  const timestamp = Date.now();
  return `${folder}/${timestamp}-${safeName}`;
}

async function uploadFile(bucket, folder, file) {
  if (!file || !file.buffer) {
    return null;
  }

  if (!supabase) {
    throw new Error('Supabase storage is not configured.');
  }

  const storagePath = buildStoragePath(folder, file.originalname);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return {
    storage_path: storagePath,
    file_url: data?.publicUrl || null,
    file_name: file.originalname,
    file_type: file.mimetype
  };
}

async function uploadMaterialFile(file) {
  return uploadFile(materialsBucket, 'materials', file);
}

async function uploadSubmissionFile(file) {
  return uploadFile(submissionsBucket, 'submissions', file);
}

module.exports = {
  uploadMaterialFile,
  uploadSubmissionFile
};

const fs = require('fs');
const path = require('path');

const replacements = [
  ['LearnHub', 'SkillBridge'],
  ['learnhub', 'skillbridge'],
  ['@learnhub.test', '@skillbridge.test'],
  ['learnhub_db', 'skillbridge_db'],
  ['learnhub_token', 'skillbridge_token'],
  ['learnhub_local_development_secret_change_before_production', 'skillbridge_local_development_secret_change_before_production'],
  ['learnhub-frontend', 'skillbridge-frontend'],
  ['learnhub-backend', 'skillbridge-backend'],
];

const files = [
  'learnhub-backend/.env',
  'learnhub-backend/.env.example',
  'learnhub-backend/config/db.js',
  'learnhub-backend/database/schema.sql',
  'learnhub-backend/database/seed.sql',
  'learnhub-backend/package.json',
  'learnhub-backend/package-lock.json',
  'learnhub-backend/README.md',
  'learnhub-backend/server.js',
  'learnhub-frontend/package.json',
  'learnhub-frontend/package-lock.json',
  'learnhub-frontend/README.md',
  'learnhub-frontend/index.html',
  'learnhub-frontend/src/components/Navbar.jsx',
  'learnhub-frontend/src/context/AuthContext.jsx',
  'learnhub-frontend/src/pages/public/About.jsx',
  'learnhub-frontend/src/pages/public/Home.jsx',
  'learnhub-frontend/src/services/api.js',
  'learnhub-frontend/src/styles.css',
];

files.forEach((relativePath) => {
  const filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing file: ${relativePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${relativePath}`);
});

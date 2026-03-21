const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirsToCheck = ['backend', 'frontend'];
let totalFiles = 0;
let errorsFound = 0;

function checkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') {
        checkDir(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css')) {
      if (file.endsWith('.js')) {
        totalFiles++;
        try {
          execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
        } catch (error) {
          console.error(`\n[ERROR] Syntax error in ${fullPath}:`);
          console.error(error.stderr.toString());
          errorsFound++;
        }
      }
    }
  }
}

console.log('Starting syntax check...');
dirsToCheck.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) checkDir(fullDir);
});

console.log(`\nCheck completed: Scanned ${totalFiles} JavaScript files.`);
if (errorsFound === 0) {
  console.log('✅ No syntax errors found!');
} else {
  console.log(`❌ Found ${errorsFound} errors.`);
}

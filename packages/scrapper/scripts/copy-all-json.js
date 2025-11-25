const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../results/4_final/ALL.json');
const targetDir = path.join(__dirname, '../../addon/src/db');
const targetFile = path.join(targetDir, 'ALL.json');

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.warn(`Warning: Source file ${sourceFile} does not exist. Skipping copy.`);
  process.exit(0);
}

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Copy the file
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`Copied: ${sourceFile} -> ${targetFile}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}


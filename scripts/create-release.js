const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const releaseNote = args.join(' ');

if (!releaseNote) {
  console.error('Please provide a release note');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Increment minor version
const newVersion = `${major}.${minor + 1}.${patch}`;
packageJson.version = newVersion;

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Create or update CHANGELOG.md
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let changelog = '';

if (fs.existsSync(changelogPath)) {
  changelog = fs.readFileSync(changelogPath, 'utf8');
}

const date = new Date().toISOString().split('T')[0];
const newEntry = `\n## ${newVersion} - ${date}\n\n${releaseNote}\n`;

// Add new entry at the beginning
changelog = newEntry + changelog;

// Write updated changelog
fs.writeFileSync(changelogPath, changelog);

console.log(`Version updated to ${newVersion}`);
console.log('Release note added to CHANGELOG.md'); 
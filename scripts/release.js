const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide a release message');
  process.exit(1);
}

const releaseMessage = args.join(' ');

// Read current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const currentVersion = packageJson.version;

// Increment version (e.g., 1.0.0 -> 1.1.0)
const [major, minor, patch] = currentVersion.split('.').map(Number);
const newVersion = `${major}.${minor + 1}.${patch}`;

// Update package.json with new version
packageJson.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Create versioned folder (e.g., v1.1)
const versionFolder = `v${newVersion}`;
fs.mkdirSync(versionFolder, { recursive: true });

// Copy project files to versioned folder, excluding node_modules, .git, etc.
const excludeDirs = ['node_modules', '.git', versionFolder];
const files = fs.readdirSync('.');
files.forEach(file => {
  if (!excludeDirs.includes(file)) {
    const sourcePath = path.join('.', file);
    const destPath = path.join(versionFolder, file);
    if (fs.statSync(sourcePath).isDirectory()) {
      fsExtra.copySync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
});

console.log(`Released version ${newVersion} in folder ${versionFolder}`);

// Update CHANGELOG.md
const changelogPath = 'CHANGELOG.md';
let changelog = '';
if (fs.existsSync(changelogPath)) {
  changelog = fs.readFileSync(changelogPath, 'utf-8');
}
const newChangelogEntry = `\n## ${newVersion} - ${new Date().toISOString().split('T')[0]}\n\n${releaseMessage}\n`;
fs.writeFileSync(changelogPath, newChangelogEntry + changelog);

console.log(`Updated CHANGELOG.md for version ${newVersion}`);

// Generate documentation
console.log('Generating documentation...');
execSync('npm run docs:generate', { stdio: 'inherit' });

// Run screenshot tests
console.log('Generating screenshots...');
execSync('npm run test:screenshots', { stdio: 'inherit' });

// Commit and push changes
console.log('Committing and pushing changes...');
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "Release ${newVersion}"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });

// Create Git tag
console.log(`Creating Git tag for ${newVersion}...`);
execSync(`git tag -a v${newVersion} -m "Release ${newVersion}"`, { stdio: 'inherit' });
execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });

// Create GitHub release
console.log(`Creating GitHub release for ${newVersion}...`);
execSync(`gh release create v${newVersion} --title "Release ${newVersion}" --notes "Release ${newVersion}"`, { stdio: 'inherit' });

console.log(`Release ${newVersion} completed successfully.`);

console.log(`\nRelease ${newVersion} created successfully!`);
console.log('Release notes added to CHANGELOG.md');
console.log('Documentation generated in docs directory');
console.log('Screenshots generated');
console.log('Release completed successfully.'); 
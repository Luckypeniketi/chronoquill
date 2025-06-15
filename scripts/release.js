const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');

async function updateVersion(type) {
  // Read package.json
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const currentVersion = packageJson.version;
  
  // Bump version
  const newVersion = semver.inc(currentVersion, type);
  packageJson.version = newVersion;
  
  // Write updated package.json
  await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
  
  return newVersion;
}

async function updateChangelog(version, message) {
  const changelogPath = 'CHANGELOG.md';
  let changelog = '';
  
  try {
    changelog = await fs.readFile(changelogPath, 'utf8');
  } catch (error) {
    // Create new changelog if it doesn't exist
    changelog = '# Changelog\n\n';
  }
  
  const date = new Date().toISOString().split('T')[0];
  const newEntry = `\n## ${version} (${date})\n\n${message}\n`;
  
  // Add new entry after the first line
  const updatedChangelog = changelog.split('\n').slice(0, 1).join('\n') + newEntry + 
    changelog.split('\n').slice(1).join('\n');
  
  await fs.writeFile(changelogPath, updatedChangelog);
}

async function main() {
  try {
    // Get version type and message from command line arguments
    const type = process.argv[2];
    const message = process.argv[3];
    
    if (!type || !message) {
      console.error('Usage: node release.js <version-type> "release message"');
      console.error('Version types: major, minor, patch');
      process.exit(1);
    }
    
    // Update version
    const newVersion = await updateVersion(type);
    console.log(`Bumped version to ${newVersion}`);
    
    // Update changelog
    await updateChangelog(newVersion, message);
    console.log('Updated CHANGELOG.md');
    
    // Create git tag
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
    console.log(`Created git tag v${newVersion}`);
    
    // Commit changes
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: release v${newVersion}"`);
    console.log('Committed changes');
    
  } catch (error) {
    console.error('Error during release:', error);
    process.exit(1);
  }
}

main(); 
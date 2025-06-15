const fs = require('fs');
const path = require('path');
const { AIService } = require('../src/services/ai');

async function updateDocumentation() {
  try {
    // Read current documentation
    const docsDir = path.join(__dirname, '..', 'docs');
    const versions = fs.readdirSync(docsDir)
      .filter(dir => dir.startsWith('v'))
      .sort()
      .reverse();

    const latestVersion = versions[0];
    const latestDocsPath = path.join(docsDir, latestVersion, 'user-guide.md');
    const currentDocs = fs.existsSync(latestDocsPath)
      ? fs.readFileSync(latestDocsPath, 'utf8')
      : '';

    // Get screenshots
    const screenshotsDir = path.join(docsDir, latestVersion, 'assets');
    const screenshots = fs.existsSync(screenshotsDir)
      ? fs.readdirSync(screenshotsDir)
      : [];

    // Read changelog
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    const changelog = fs.existsSync(changelogPath)
      ? fs.readFileSync(changelogPath, 'utf8')
      : '';

    // Get latest changes
    const latestChanges = changelog.split('\n## ')[1]?.split('\n').slice(2) || [];

    // Use AI to update documentation
    const docUpdate = await AIService.updateDocumentation(
      currentDocs,
      latestChanges,
      screenshots
    );

    // Generate new documentation
    const newDocs = `# ChronoQuill AI v${latestVersion} User Guide

## Introduction
${docUpdate.summary}

## Features

### Adding Tasks
To add a new task:
1. Type your task in the input field
2. Press Enter or click the "Add" button

${docUpdate.screenshots.includes('after-adding-todo.png')
  ? `![Adding a task](assets/after-adding-todo.png)`
  : ''}

### Managing Tasks
- Check the checkbox to mark a task as complete
- Click the "Delete" button to remove a task

${docUpdate.screenshots.includes('after-toggling-todo.png')
  ? `![Managing tasks](assets/after-toggling-todo.png)`
  : ''}

## Recent Changes
${docUpdate.changes.map(change => `- ${change}`).join('\n')}

## Version History
Current version: ${latestVersion}

## Support
For any issues or questions, please open an issue on our GitHub repository.
`;

    // Write updated documentation
    fs.writeFileSync(latestDocsPath, newDocs);
    console.log(`Documentation updated for version ${latestVersion}`);

  } catch (error) {
    console.error('Error updating documentation:', error);
    process.exit(1);
  }
}

updateDocumentation(); 
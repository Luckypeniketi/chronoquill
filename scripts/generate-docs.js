const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runTestsAndCaptureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the app
  await page.goto('http://localhost:3000');
  
  // Take screenshots of key interactions
  const screenshots = [];
  
  // Screenshot 1: Initial state
  await page.screenshot({ path: 'screenshots/initial-state.png' });
  screenshots.push({
    name: 'Initial State',
    path: 'screenshots/initial-state.png'
  });

  // Screenshot 2: Adding a task
  await page.click('button:has-text("Add Task")');
  await page.fill('input[placeholder="Enter task..."]', 'Test Task');
  await page.click('button:has-text("Add Task")');
  await page.screenshot({ path: 'screenshots/add-task.png' });
  screenshots.push({
    name: 'Adding a Task',
    path: 'screenshots/add-task.png'
  });

  // Screenshot 3: Task in calendar
  await page.screenshot({ path: 'screenshots/task-in-calendar.png' });
  screenshots.push({
    name: 'Task in Calendar',
    path: 'screenshots/task-in-calendar.png'
  });

  await browser.close();
  return screenshots;
}

async function generateDocumentation(screenshots) {
  // Read package.json for version
  const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
  const version = packageJson.version;

  // Create docs directory if it doesn't exist
  const docsDir = path.join('docs', `v${version}`);
  await fs.mkdir(docsDir, { recursive: true });

  // Prepare screenshots for OpenAI
  const screenshotDescriptions = screenshots.map(s => 
    `Screenshot "${s.name}" shows: ${s.path}`
  ).join('\n');

  // Generate documentation using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a technical writer creating user documentation for ChronoQuill AI."
      },
      {
        role: "user",
        content: `Please create a comprehensive user guide for ChronoQuill AI version ${version}. 
        Include sections for:
        1. Introduction
        2. Features
        3. Getting Started
        4. Task Management
        5. Calendar View
        6. Version History
        
        Use these screenshots as reference:
        ${screenshotDescriptions}`
      }
    ]
  });

  const documentation = completion.choices[0].message.content;

  // Write documentation to file
  await fs.writeFile(
    path.join(docsDir, 'user-guide.md'),
    documentation
  );

  // Commit changes
  execSync('git add docs/');
  execSync(`git commit -m "docs: update documentation for v${version}"`);
}

async function main() {
  try {
    // Create screenshots directory
    await fs.mkdir('screenshots', { recursive: true });

    // Run tests and capture screenshots
    const screenshots = await runTestsAndCaptureScreenshots();

    // Generate documentation
    await generateDocumentation(screenshots);

    console.log('Documentation generated successfully!');
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

main(); 
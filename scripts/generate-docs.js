// scripts/generate-docs.js
// Usage: node scripts/generate-docs.js
// Requires: npm install openai glob

const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const glob = require('glob');

// Insert your OpenAI API key here
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
});
const openai = new OpenAIApi(configuration);

function readFiles(pattern) {
  return glob.sync(pattern).map(file => ({
    file,
    content: fs.readFileSync(file, 'utf-8')
  }));
}

async function generateDoc(prompt, filename) {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2048
  });
  fs.writeFileSync(filename, response.data.choices[0].message.content);
  console.log(`Generated ${filename}`);
}

async function main() {
  const releaseNotes = fs.existsSync('RELEASE_NOTES.md') ? fs.readFileSync('RELEASE_NOTES.md', 'utf-8') : '';
  const codeFiles = readFiles('src/**/*.ts*').map(f => `File: ${f.file}\n${f.content}`).join('\n\n');

  const readmePrompt = `You are an expert technical writer. Given the following codebase and release notes, generate a concise, clear README.md for the project.\n\nRelease Notes:\n${releaseNotes}\n\nCodebase:\n${codeFiles}`;
  await generateDoc(readmePrompt, 'README.md');

  const userGuidePrompt = `You are an expert in user education. Given the following codebase and release notes, generate a detailed USER_GUIDE.md for end users.\n\nRelease Notes:\n${releaseNotes}\n\nCodebase:\n${codeFiles}`;
  await generateDoc(userGuidePrompt, 'USER_GUIDE.md');
}

main(); 
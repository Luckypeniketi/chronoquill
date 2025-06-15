const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versions = {
  'v1.0-inkling': {
    name: 'Inkling',
    description: 'Core To-Do & Calendar functionalities'
  },
  'v1.1-footnote': {
    name: 'Footnote',
    description: 'Smart Priorities and AI suggestions'
  },
  'v2.0-chapter': {
    name: 'Chapter',
    description: 'Team Sharing and real-time updates'
  }
};

function copyVersion(version, targetDir) {
  const sourceDir = path.join(__dirname, '..', 'versions', version);

  // Check if version exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Version ${version} does not exist!`);
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy all files from version directory to target directory
  try {
    // Copy package.json
    fs.copyFileSync(
      path.join(sourceDir, 'package.json'),
      path.join(targetDir, 'package.json')
    );

    // Copy page.tsx
    fs.copyFileSync(
      path.join(sourceDir, 'page.tsx'),
      path.join(targetDir, 'page.tsx')
    );

    // Create necessary directories
    const dirs = ['src', 'src/app', 'public', 'styles'];
    dirs.forEach(dir => {
      const dirPath = path.join(targetDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });

    // Move page.tsx to src/app
    fs.renameSync(
      path.join(targetDir, 'page.tsx'),
      path.join(targetDir, 'src', 'app', 'page.tsx')
    );

    console.log(`\n✅ Successfully copied ${version} "${versions[version].name}" to ${targetDir}`);
    console.log(`📝 ${versions[version].description}\n`);

    // Initialize git repository if not already initialized
    if (!fs.existsSync(path.join(targetDir, '.git'))) {
      console.log('Initializing git repository...');
      execSync('git init', { cwd: targetDir, stdio: 'inherit' });
    }

    // Create .gitignore
    const gitignoreContent = `
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
    `.trim();

    fs.writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent);

    console.log('\nNext steps:');
    console.log(`1. cd ${targetDir}`);
    console.log('2. npm install');
    console.log('3. npm run dev');
    console.log('4. git add .');
    console.log('5. git commit -m "Initial commit"');
    console.log('6. git remote add origin <your-repo-url>');
    console.log('7. git push -u origin main\n');

  } catch (error) {
    console.error('Error copying version:', error);
    process.exit(1);
  }
}

// Get version and target directory from command line arguments
const version = process.argv[2];
const targetDir = process.argv[3];

if (!version || !targetDir) {
  console.log('\nAvailable versions:');
  Object.entries(versions).forEach(([v, info]) => {
    console.log(`\n${v} "${info.name}"`);
    console.log(`   ${info.description}`);
  });
  console.log('\nUsage: node copy-version.js <version> <target-directory>');
  console.log('Example: node copy-version.js v1.0-inkling ../chronoquill-v1');
  process.exit(1);
}

copyVersion(version, targetDir); 
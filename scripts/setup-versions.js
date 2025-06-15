const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory structure to copy
const baseFiles = [
  'next.config.js',
  'postcss.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  '.gitignore',
  'README.md'
];

// Create necessary directories in target
function createDirectories(targetDir) {
  const dirs = [
    'src',
    'src/app',
    'public',
    'styles',
    '.github',
    'docs'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(targetDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Copy base files
function copyBaseFiles(sourceDir, targetDir) {
  baseFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Create package.json for each version
function createPackageJson(targetDir, version, name, description) {
  const packageJson = {
    name: `chronoquill-${name.toLowerCase()}`,
    version: version,
    description: description,
    scripts: {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "test": "jest",
      "docs": "node scripts/generate-docs.js",
      "release": "node scripts/release.js"
    },
    dependencies: {
      "date-fns": "^2.30.0",
      "next": "14.1.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/node": "^20.11.19",
      "@types/react": "^18.2.57",
      "@types/react-dom": "^18.2.19",
      "autoprefixer": "^10.4.17",
      "eslint": "^8.56.0",
      "eslint-config-next": "14.1.0",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.3.3"
    }
  };

  // Add version-specific dependencies
  if (version === '1.1.0') {
    packageJson.dependencies.openai = "^4.28.0";
  } else if (version === '2.0.0') {
    packageJson.dependencies.openai = "^4.28.0";
    packageJson.dependencies["socket.io-client"] = "^4.7.4";
  }

  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Copy version-specific page.tsx
function copyPageTsx(sourceDir, targetDir, version) {
  let versionDir;
  switch(version) {
    case '1.0.0':
      versionDir = 'v1.0-inkling';
      break;
    case '1.1.0':
      versionDir = 'v1.1-footnote';
      break;
    case '2.0.0':
      versionDir = 'v2.0-chapter';
      break;
    default:
      throw new Error(`Unknown version: ${version}`);
  }

  const sourcePath = path.join(sourceDir, 'versions', versionDir, 'page.tsx');
  const targetPath = path.join(targetDir, 'src', 'app', 'page.tsx');
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
  } else {
    console.error(`Source file not found: ${sourcePath}`);
  }
}

// Setup a specific version
function setupVersion(sourceDir, targetDir, version, name, description) {
  console.log(`\nSetting up ${name} (v${version})...`);
  
  // Create directories
  createDirectories(targetDir);
  
  // Copy base files
  copyBaseFiles(sourceDir, targetDir);
  
  // Create package.json
  createPackageJson(targetDir, version, name, description);
  
  // Copy version-specific page.tsx
  copyPageTsx(sourceDir, targetDir, version);
  
  console.log(`✅ Successfully set up ${name} (v${version}) in ${targetDir}`);
}

// Main function
function setupAllVersions() {
  const sourceDir = path.join(__dirname, '..');
  const baseDir = path.dirname(sourceDir);

  // Setup v1.0 "Inkling"
  setupVersion(
    sourceDir,
    path.join(baseDir, 'chronoquill-v1'),
    '1.0.0',
    'Inkling',
    'Core To-Do & Calendar functionalities'
  );

  // Setup v1.1 "Footnote"
  setupVersion(
    sourceDir,
    path.join(baseDir, 'chronoquill-v1.1'),
    '1.1.0',
    'Footnote',
    'Smart Priorities and AI suggestions'
  );

  // Setup v2.0 "Chapter"
  setupVersion(
    sourceDir,
    path.join(baseDir, 'chronoquill-v2'),
    '2.0.0',
    'Chapter',
    'Team Sharing and real-time updates'
  );

  console.log('\n🎉 All versions have been set up!');
  console.log('\nNext steps for each version:');
  console.log('1. cd <version-directory>');
  console.log('2. npm install');
  console.log('3. npm run dev');
  console.log('4. git init');
  console.log('5. git add .');
  console.log('6. git commit -m "Initial commit"');
  console.log('7. git remote add origin <your-repo-url>');
  console.log('8. git push -u origin main\n');
}

// Run the setup
setupAllVersions(); 
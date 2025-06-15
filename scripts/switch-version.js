const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const versions = {
  'v1.0': {
    name: 'Inkling',
    description: 'Core To-Do & Calendar functionalities'
  },
  'v1.1': {
    name: 'Footnote',
    description: 'Smart Priorities and AI suggestions'
  },
  'v2.0': {
    name: 'Chapter',
    description: 'Team Sharing and real-time updates'
  }
};

function switchVersion(version) {
  const sourceDir = path.join(__dirname, '..', 'versions', version);
  const targetDir = path.join(__dirname, '..', 'src', 'app');

  // Check if version exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Version ${version} does not exist!`);
    process.exit(1);
  }

  // Copy version files to app directory
  try {
    // Remove existing page.tsx
    if (fs.existsSync(path.join(targetDir, 'page.tsx'))) {
      fs.unlinkSync(path.join(targetDir, 'page.tsx'));
    }

    // Copy new page.tsx
    fs.copyFileSync(
      path.join(sourceDir, 'page.tsx'),
      path.join(targetDir, 'page.tsx')
    );

    console.log(`\n✅ Successfully switched to ${version} "${versions[version].name}"`);
    console.log(`📝 ${versions[version].description}\n`);

    // Update package.json version
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Restart development server
    console.log('🔄 Restarting development server...\n');
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error switching versions:', error);
    process.exit(1);
  }
}

// Get version from command line argument
const version = process.argv[2];

if (!version) {
  console.log('\nAvailable versions:');
  Object.entries(versions).forEach(([v, info]) => {
    console.log(`\n${v} "${info.name}"`);
    console.log(`   ${info.description}`);
  });
  console.log('\nUsage: node switch-version.js <version>');
  process.exit(1);
}

switchVersion(version); 
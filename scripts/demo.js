const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const roles = {
  'sam': {
    name: 'Sam the Solo Dev',
    interface: 'Cursor IDE',
    steps: [
      {
        title: 'Development in Cursor',
        description: 'Using Cursor IDE for development',
        commands: [
          'code .', // Open in Cursor
          'npm run dev' // Start development server
        ]
      },
      {
        title: 'AI-Powered Development',
        description: 'Using Cursor\'s AI features for code generation and documentation',
        commands: [
          'npm run docs' // Generate documentation
        ]
      },
      {
        title: 'Version Control in Cursor',
        description: 'Managing versions and releases through Cursor',
        commands: [
          'npm run release patch "Demo release"'
        ]
      }
    ]
  },
  'pat': {
    name: 'Pat the PM',
    interface: 'GitHub Desktop',
    steps: [
      {
        title: 'Release Management',
        description: 'Using GitHub Desktop to track releases and documentation',
        commands: [
          'git log --oneline --graph --all', // Show commit history
          'cat CHANGELOG.md' // View changelog
        ]
      },
      {
        title: 'Documentation Review',
        description: 'Reviewing generated documentation in GitHub',
        commands: [
          'ls -R docs/' // List documentation structure
        ]
      },
      {
        title: 'Version Tracking',
        description: 'Tracking versions and features in GitHub',
        commands: [
          'git tag -l' // List version tags
        ]
      }
    ]
  },
  'dana': {
    name: 'Dana the Daily-User',
    interface: 'ChronoQuill Web App',
    steps: [
      {
        title: 'Launch Application',
        description: 'Opening ChronoQuill in the browser',
        commands: [
          'npm run dev' // Start the app
        ],
        instructions: 'Navigate to http://localhost:3000 in your browser'
      },
      {
        title: 'Calendar View',
        description: 'Using the calendar interface',
        instructions: [
          'View the monthly calendar',
          'Navigate between months using the arrows',
          'See today\'s date highlighted in blue'
        ]
      },
      {
        title: 'Task Management',
        description: 'Managing daily tasks',
        instructions: [
          'Click "Add Task" on any day',
          'Enter task details in the modal',
          'Click "Add Task" to save',
          'Check/uncheck tasks to mark them complete'
        ]
      },
      {
        title: 'Quick Actions',
        description: 'Using quick task management features',
        instructions: [
          'Delete tasks using the delete button',
          'View tasks for any day',
          'See task completion status'
        ]
      }
    ]
  }
};

const versions = {
  'v1.0': {
    name: 'Inkling',
    features: [
      'Core To-Do & Calendar',
      'Create / edit / delete tasks & events',
      'Day & week views',
      'Local storage sync'
    ]
  },
  'v1.1': {
    name: 'Footnote',
    features: [
      'Smart Priorities',
      'Toggle "☄️ Priority" on tasks',
      'AI suggests re-scheduling overdue items'
    ]
  },
  'v2.0': {
    name: 'Chapter',
    features: [
      'Team Sharing',
      'Invite teammates',
      'Real-time updates via Supabase Realtime'
    ]
  }
};

async function runDemo() {
  console.log('\n=== ChronoQuill AI POC Demo ===\n');
  
  // Show available roles
  console.log('Available Roles:');
  Object.keys(roles).forEach(key => {
    console.log(`- ${key}: ${roles[key].name} (${roles[key].interface})`);
  });
  
  // Get role selection
  const role = await new Promise(resolve => {
    rl.question('\nSelect a role to demo (sam/pat/dana): ', answer => {
      resolve(answer.toLowerCase());
    });
  });
  
  if (!roles[role]) {
    console.log('Invalid role selected');
    rl.close();
    return;
  }
  
  console.log(`\n=== Demo for ${roles[role].name} ===`);
  console.log(`Interface: ${roles[role].interface}\n`);
  
  // Show available versions
  console.log('Available Versions:');
  Object.keys(versions).forEach(key => {
    console.log(`\n${key} "${versions[key].name}":`);
    versions[key].features.forEach(feature => {
      console.log(`- ${feature}`);
    });
  });
  
  // Get version selection
  const version = await new Promise(resolve => {
    rl.question('\nSelect a version to demo (v1.0/v1.1/v2.0): ', answer => {
      resolve(answer.toLowerCase());
    });
  });
  
  if (!versions[version]) {
    console.log('Invalid version selected');
    rl.close();
    return;
  }
  
  console.log(`\n=== Demo Steps for ${roles[role].name} (${version} "${versions[version].name}") ===`);
  console.log(`Using: ${roles[role].interface}\n`);
  
  // Run demo steps
  for (const step of roles[role].steps) {
    console.log(`\n${step.title}:`);
    console.log(step.description);
    
    if (step.commands) {
      for (const command of step.commands) {
        try {
          console.log('\nExecuting command:', command);
          execSync(command, { stdio: 'inherit' });
        } catch (error) {
          console.log('Command failed:', error.message);
        }
      }
    }
    
    if (step.instructions) {
      console.log('\nInstructions:');
      if (Array.isArray(step.instructions)) {
        step.instructions.forEach((instruction, index) => {
          console.log(`${index + 1}. ${instruction}`);
        });
      } else {
        console.log(step.instructions);
      }
    }
    
    await new Promise(resolve => {
      rl.question('\nPress Enter to continue...', () => {
        resolve();
      });
    });
  }
  
  console.log('\nDemo completed!');
  rl.close();
}

runDemo(); 
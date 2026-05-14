const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();

const targets = [
  {
    name: 'drivelist',
    output: path.join(root, 'node_modules', 'drivelist', 'build', 'Release', 'drivelist.node'),
    command: 'npm',
    args: ['rebuild', 'drivelist'],
  },
  {
    name: 'native-keymap',
    output: path.join(root, 'node_modules', 'native-keymap', 'build', 'Release', 'keymapping.node'),
    command: 'npm',
    args: ['rebuild', 'native-keymap'],
  },
  {
    name: '@theia/ffmpeg',
    output: path.join(root, 'node_modules', '@theia', 'ffmpeg', 'build', 'Release', 'ffmpeg.node'),
    command: process.execPath,
    args: [
      path.join(root, 'node_modules', 'node-gyp', 'bin', 'node-gyp.js'),
      'rebuild',
    ],
    cwd: path.join(root, 'node_modules', '@theia', 'ffmpeg'),
  },
];

function runStep(step) {
  console.log(`[native] rebuilding ${step.name}`);
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd || root,
    stdio: 'inherit',
    shell: process.platform === 'win32' && step.command === 'npm',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const missing = targets.filter(step => !fs.existsSync(step.output));

if (missing.length === 0) {
  console.log('[native] using cached native dependencies');
  process.exit(0);
}

for (const step of missing) {
  runStep(step);
}

#!/usr/bin/env node

/**
 * Auto Rebuild Watcher
 * Automatically rebuilds the project when API files change
 * Watches src/api and src/integrations directories
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const WATCH_DIRS = [
  'src/api',
  'src/integrations',
  'src/prompts',
  'src/components',
];

const DEBOUNCE_TIME = 1000; // 1 second
let rebuildTimeout = null;
let isRebuilding = false;

console.log('🔍 Auto Rebuild Watcher Started');
console.log(`📁 Watching directories: ${WATCH_DIRS.join(', ')}`);
console.log('⏳ Waiting for file changes...\n');

/**
 * Run rebuild command
 */
function runRebuild() {
  if (isRebuilding) {
    console.log('⏳ Rebuild already in progress, skipping...');
    return;
  }

  isRebuilding = true;
  console.log('\n🔨 Building project...');

  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
  });

  build.on('close', (code) => {
    isRebuilding = false;
    if (code === 0) {
      console.log('✅ Build completed successfully!');
      console.log('🚀 API endpoints are now live!\n');
    } else {
      console.log(`❌ Build failed with code ${code}\n`);
    }
  });

  build.on('error', (error) => {
    isRebuilding = false;
    console.error('❌ Build error:', error);
  });
}

/**
 * Debounced rebuild trigger
 */
function triggerRebuild() {
  if (rebuildTimeout) {
    clearTimeout(rebuildTimeout);
  }

  rebuildTimeout = setTimeout(() => {
    runRebuild();
  }, DEBOUNCE_TIME);
}

/**
 * Watch directory recursively
 */
function watchDirectory(dir) {
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      // Ignore node_modules, dist, build, .next
      if (
        filename.includes('node_modules') ||
        filename.includes('dist') ||
        filename.includes('build') ||
        filename.includes('.next') ||
        filename.includes('.git')
      ) {
        return;
      }

      // Only watch TypeScript and JavaScript files
      if (!filename.endsWith('.ts') && !filename.endsWith('.tsx') && !filename.endsWith('.js')) {
        return;
      }

      console.log(`📝 File changed: ${dir}/${filename}`);
      triggerRebuild();
    });
  } catch (error) {
    console.error(`Error watching ${dir}:`, error.message);
  }
}

/**
 * Start watching all directories
 */
function startWatching() {
  WATCH_DIRS.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      watchDirectory(fullPath);
      console.log(`✓ Watching ${dir}`);
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Watcher stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Watcher stopped');
  process.exit(0);
});

// Start watching
startWatching();

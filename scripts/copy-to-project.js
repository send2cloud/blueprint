#!/usr/bin/env node

/**
 * Blueprint Copy Script
 * 
 * Copies Blueprint into another project with all necessary files.
 * Usage: node scripts/copy-to-project.js /path/to/target/project
 * 
 * This script:
 * 1. Copies src/, public/, and config files to target/blueprint/
 * 2. Outputs the npm install command for dependencies
 * 3. Shows Vite config additions needed
 */

const fs = require('fs');
const path = require('path');

const BLUEPRINT_ROOT = path.resolve(__dirname, '..');
const FILES_TO_COPY = [
  'src',
  'public', 
  'index.html',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'components.json',
  '.env.example',
];

const DEPENDENCIES = [
  '@blocknote/core',
  '@blocknote/react', 
  '@blocknote/mantine',
  '@hello-pangea/dnd',
  '@instantdb/react',
  '@xyflow/react',
  'tldraw',
  'react-big-calendar',
  'date-fns',
  'lucide-react',
  'uuid',
  '@types/uuid',
  'next-themes',
  'sonner',
  'vaul',
  'cmdk',
  '@tanstack/react-query',
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      // Skip node_modules and build artifacts
      if (item === 'node_modules' || item === 'dist' || item === '.git') continue;
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function main() {
  const targetProject = process.argv[2];
  
  if (!targetProject) {
    console.log(`
🎨 Blueprint Copy Script

Usage: node scripts/copy-to-project.js /path/to/target/project

This will create a /blueprint folder in your target project with all Blueprint files.
`);
    process.exit(1);
  }

  const targetDir = path.resolve(targetProject, 'blueprint');
  
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: ${targetDir} already exists.`);
    process.exit(1);
  }

  console.log(`🎨 Copying Blueprint to ${targetDir}...\n`);
  
  fs.mkdirSync(targetDir, { recursive: true });

  for (const item of FILES_TO_COPY) {
    const src = path.join(BLUEPRINT_ROOT, item);
    const dest = path.join(targetDir, item);
    
    if (fs.existsSync(src)) {
      console.log(`  📄 ${item}`);
      copyRecursive(src, dest);
    }
  }

  console.log(`
✅ Files copied successfully!

📦 Next, install dependencies in your project root:

npm install ${DEPENDENCIES.join(' ')}

⚙️ Add to your vite.config.ts resolve.dedupe:

resolve: {
  dedupe: [
    "@tiptap/pm",
    "prosemirror-state",
    "prosemirror-view", 
    "prosemirror-model",
    "prosemirror-transform",
    "prosemirror-commands",
    "prosemirror-history",
    "prosemirror-keymap",
    "prosemirror-inputrules",
    "prosemirror-schema-list",
    "prosemirror-gapcursor",
    "prosemirror-dropcursor",
  ],
}

🔗 Mount in your app router:

import { lazy } from 'react';
const BlueprintApp = lazy(() => import('./blueprint/src/App'));

<Route path="/blueprint/*" element={<BlueprintApp />} />
`);
}

main();

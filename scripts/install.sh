#!/bin/bash

# Blueprint Install Script
# Usage: curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/install.sh | bash
# Or: ./scripts/install.sh /path/to/target

set -e

TARGET_DIR="${1:-.}"
BLUEPRINT_DIR="$TARGET_DIR/blueprint"

echo "🎨 Installing Blueprint to $BLUEPRINT_DIR..."

# Check if target exists
if [ -d "$BLUEPRINT_DIR" ]; then
  echo "❌ Error: $BLUEPRINT_DIR already exists. Remove it first or choose a different location."
  exit 1
fi

# Clone via degit (no git history, clean copy)
if command -v npx &> /dev/null; then
  echo "📦 Cloning Blueprint (via degit)..."
  npx degit send2cloud/blueprint "$BLUEPRINT_DIR"
else
  echo "❌ Error: npx not found. Please install Node.js first."
  exit 1
fi

echo ""
echo "✅ Blueprint downloaded successfully!"
echo ""

if [ -f "$TARGET_DIR/package.json" ]; then
  echo "📦 Host package.json detected! Automatically merging Blueprint dependencies..."
  
  # Use node to extract dependencies from blueprint package.json, excluding react & react-dom to avoid duplicate useRef collisions!
  DEPS=$(node -e "
    const fs = require('fs');
    try {
      const pkg = JSON.parse(fs.readFileSync('$BLUEPRINT_DIR/package.json'));
      const deps = Object.keys(pkg.dependencies || {}).filter(d => d !== 'react' && d !== 'react-dom');
      console.log(deps.join(' '));
    } catch (e) {
      console.log('');
    }
  ")
  
  if [ -n "$DEPS" ]; then
    echo "Running npm install in host project..."
    cd "$TARGET_DIR"
    npm install $DEPS
    echo "✅ Dependencies integrated into host project."
  else
    echo "⚠️ Could not parse Blueprint dependencies."
  fi
  
  echo ""
  echo "🎉 EMBED INSTALLATION COMPLETE!"
  echo "To finish setup in your app, ask your AI (or do manually):"
  echo "  1. Add ProseMirror dedupe array to your vite.config.ts (See blueprint/INSTALL.md)"
  echo "  2. import BlueprintApp from './blueprint/src/App';"
  echo "  3. Mount <Route path=\"/blueprint/*\" element={<BlueprintApp />} />"
else
  echo "⚠️ No host package.json found. If running standalone:"
  echo "  1. cd $BLUEPRINT_DIR && npm install && npm run dev"
  echo "  2. Open the dev URL provided in your terminal"
fi
echo ""

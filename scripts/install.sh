#!/bin/bash

# Blueprint Install Script
# Usage: curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh | bash
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
  echo "📦 Host package.json detected — Solo mode (embedding)."
  echo ""
  echo "Blueprint ships with a pre-built Solo bundle."
  echo "To embed it in your React app:"
  echo ""
  echo "  1. import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';"
  echo "  2. import './blueprint/dist-lib/style.css';"
  echo "  3. Mount: <Route path=\"/blueprint/*\" element={<BlueprintApp basename=\"/blueprint\" />} />"
  echo ""
  echo "🎉 SOLO INSTALLATION COMPLETE!"
else
  echo "⚠️ No host package.json found. For Multi-Project (standalone) mode:"
  echo "  1. cd $BLUEPRINT_DIR && npm install && npm run dev"
  echo "  2. Open the dev URL provided in your terminal"
fi
echo ""

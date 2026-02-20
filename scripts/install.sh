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

# Install dependencies
echo "📦 Installing dependencies..."
cd "$BLUEPRINT_DIR"
npm install

echo ""
echo "✅ Blueprint installed successfully!"
echo ""
echo "Next steps:"
echo "  1. cd $BLUEPRINT_DIR && npm run dev"
echo "  2. Open http://localhost:8080"
echo ""
echo "To embed in your app, add to your router:"
echo "  import BlueprintApp from './blueprint/src/App';"
echo "  <Route path=\"/blueprint/*\" element={<BlueprintApp />} />"
echo ""

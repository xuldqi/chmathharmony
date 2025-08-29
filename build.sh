#!/bin/bash
# Local build script for HarmonyOS project

set -e

# Navigate to project directory
cd "$(dirname "$0")"

echo "🔨 Building HarmonyOS project using local hvigorw..."

# Clean and build
./hvigorw clean
./hvigorw assembleHap --analyze=normal --parallel --incremental

echo "✅ Build completed successfully!"
echo "📦 HAP file location: entry/build/default/outputs/default/"

# List the generated HAP files
ls -la entry/build/default/outputs/default/*.hap 2>/dev/null || echo "No HAP files found"
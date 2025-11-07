#!/bin/bash
set -e

echo "🚀 Starting frontend build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📂 Build output in: ./dist"

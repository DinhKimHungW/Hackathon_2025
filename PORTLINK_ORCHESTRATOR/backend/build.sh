#!/bin/bash
set -e

echo "🚀 Starting deployment build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo "🔨 Building application..."
npm run build

# Run migrations (if needed)
echo "🗃️ Running database migrations..."
# npm run migration:run

echo "✅ Build completed successfully!"

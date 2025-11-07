#!/bin/sh
set -e

echo "Starting PortLink Backend..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Start the application
exec node dist/main.js

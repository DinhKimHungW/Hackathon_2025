#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Validates project configuration before deploying to Render.com
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = {
  backend: [
    'package.json',
    'tsconfig.json',
    'nest-cli.json',
    'Dockerfile',
    '.dockerignore',
    'build.sh',
    '.env.production.example',
  ],
  frontend: [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    '.dockerignore',
    'build.sh',
    '.env.production.example',
  ],
  root: [
    'render.yaml',
    'DEPLOYMENT.md',
    'package.json',
  ],
};

const REQUIRED_ENV_VARS = {
  backend: [
    'NODE_ENV',
    'PORT',
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'REDIS_HOST',
    'REDIS_PORT',
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'CORS_ORIGIN',
  ],
  frontend: [
    'VITE_API_BASE_URL',
    'VITE_WS_URL',
  ],
};

let errors = 0;
let warnings = 0;

console.log('🚀 PortLink Deployment Readiness Check\n');
console.log('═'.repeat(60));

// Check required files
console.log('\n📁 Checking required files...');
for (const [dir, files] of Object.entries(REQUIRED_FILES)) {
  const basePath = dir === 'root' ? '.' : dir;
  
  for (const file of files) {
    const filePath = path.join(basePath, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${dir}/${file}`);
    } else {
      console.error(`  ❌ MISSING: ${dir}/${file}`);
      errors++;
    }
  }
}

// Check environment variable templates
console.log('\n🔐 Checking environment configuration...');
for (const [dir, vars] of Object.entries(REQUIRED_ENV_VARS)) {
  const examplePath = path.join(dir, '.env.production.example');
  
  if (!fs.existsSync(examplePath)) {
    console.error(`  ❌ Missing ${dir}/.env.production.example`);
    errors++;
    continue;
  }

  const content = fs.readFileSync(examplePath, 'utf8');
  const missingVars = vars.filter(v => !content.includes(v));
  
  if (missingVars.length === 0) {
    console.log(`  ✅ ${dir} environment variables documented`);
  } else {
    console.warn(`  ⚠️  ${dir} missing variables: ${missingVars.join(', ')}`);
    warnings++;
  }
}

// Check package.json scripts
console.log('\n📦 Checking build scripts...');
const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));

const requiredScripts = {
  backend: ['build', 'start:prod'],
  frontend: ['build'],
};

for (const [dir, scripts] of Object.entries(requiredScripts)) {
  const pkg = dir === 'backend' ? backendPkg : frontendPkg;
  
  for (const script of scripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  ✅ ${dir}: npm run ${script}`);
    } else {
      console.error(`  ❌ ${dir}: Missing "npm run ${script}" script`);
      errors++;
    }
  }
}

// Check render.yaml
console.log('\n☁️  Checking Render configuration...');
if (fs.existsSync('render.yaml')) {
  const renderConfig = fs.readFileSync('render.yaml', 'utf8');
  
  const checks = [
    { pattern: /type:\s*pserv/, label: 'PostgreSQL database' },
    { pattern: /type:\s*redis/, label: 'Redis cache' },
    { pattern: /name:\s*portlink-backend/, label: 'Backend service' },
    { pattern: /name:\s*portlink-frontend/, label: 'Frontend service' },
    { pattern: /buildCommand/, label: 'Build commands' },
    { pattern: /startCommand/, label: 'Start commands' },
  ];
  
  for (const check of checks) {
    if (check.pattern.test(renderConfig)) {
      console.log(`  ✅ ${check.label} configured`);
    } else {
      console.warn(`  ⚠️  ${check.label} not found`);
      warnings++;
    }
  }
} else {
  console.error('  ❌ render.yaml not found');
  errors++;
}

// Check Node.js version
console.log('\n🟢 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`  ✅ Node.js ${nodeVersion} (compatible)`);
} else {
  console.error(`  ❌ Node.js ${nodeVersion} (need v18+)`);
  errors++;
}

// Security checks
console.log('\n🔒 Security checks...');
const securityFiles = [
  'backend/.env',
  'frontend/.env',
  'backend/.env.local',
  'frontend/.env.local',
  'backend/.env.production',
  'frontend/.env.production',
];

let foundEnvFiles = false;
for (const file of securityFiles) {
  if (fs.existsSync(file)) {
    console.warn(`  ⚠️  Found ${file} - ensure it's in .gitignore`);
    warnings++;
    foundEnvFiles = true;
  }
}

if (!foundEnvFiles) {
  console.log('  ✅ No sensitive .env files in repository');
}

// Final summary
console.log('\n' + '═'.repeat(60));
console.log('\n📊 Summary:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n✨ All checks passed! Ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Commit and push to GitHub');
  console.log('2. Connect repository to Render.com');
  console.log('3. Set environment variables in Render dashboard');
  console.log('4. Deploy!\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('\n⚠️  Deployment possible, but review warnings.\n');
  process.exit(0);
} else {
  console.log('\n❌ Fix errors before deploying.\n');
  process.exit(1);
}

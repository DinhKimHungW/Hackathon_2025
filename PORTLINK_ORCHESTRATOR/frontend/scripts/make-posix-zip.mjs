import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const distDir = path.resolve(process.cwd(), 'dist');
const outPath = path.resolve(process.cwd(), 'frontend-posix.zip');

if (!fs.existsSync(distDir)) {
  console.error('dist folder not found at', distDir);
  process.exit(1);
}

if (fs.existsSync(outPath)) fs.rmSync(outPath);

const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created ${outPath} (${archive.pointer()} bytes)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => { throw err; });

archive.pipe(output);
// This ensures forward slashes in entries
archive.directory(distDir + '/', false);

await archive.finalize();

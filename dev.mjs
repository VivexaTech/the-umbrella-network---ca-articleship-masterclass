import { spawn } from 'child_process';

let port = '3000';
let host = '0.0.0.0';

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--port' || arg === '-p') {
    port = process.argv[++i] || '3000';
  } else if (arg === '--host' || arg === '--hostname' || arg === '-H') {
    host = process.argv[++i] || '0.0.0.0';
  }
}

console.log(`[Dev Runner] Starting Next.js dev server on ${host}:${port}`);
const child = spawn('npx', ['next', 'dev', '-p', port, '-H', host], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

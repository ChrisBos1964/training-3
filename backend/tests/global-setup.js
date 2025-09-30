import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const projectRoot = path.join(__dirname, '..');
  try {
    // Ensure DB schema and seed data
    execSync('npm run init-db | cat', {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });
  } catch (e) {
    console.warn('Warning: DB init failed, continuing tests', e.message);
  }
}



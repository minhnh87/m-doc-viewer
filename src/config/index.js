import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  projectRoot: PROJECT_ROOT,
  staticDir: path.join(PROJECT_ROOT, 'public'),
  plansDir: path.join(os.homedir(), '.claude', 'plans'),
};

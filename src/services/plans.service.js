import { config } from '../config/index.js';
import { NotFoundError } from '../lib/errors.js';
import { pathExists } from '../repositories/file-system.repo.js';
import { listPlans } from '../repositories/plans.repo.js';

/**
 * Return the newest plan markdown file in the global plans directory.
 */
export async function getLatestPlan() {
  if (!(await pathExists(config.plansDir))) {
    throw new NotFoundError('Plans directory not found');
  }
  const plans = await listPlans();
  if (plans.length === 0) {
    throw new NotFoundError('No plan files found');
  }
  const latest = plans[0];
  return { path: latest.path, name: latest.name };
}

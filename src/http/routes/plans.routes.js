import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { getLatestPlan } from '../../services/plans.service.js';

export const plansRouter = Router();

plansRouter.get('/latest-plan', asyncHandler(async (_req, res) => {
  const data = await getLatestPlan();
  res.json(data);
}));

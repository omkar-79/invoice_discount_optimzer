import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { User } from '../types/user.types';

const router = Router();
const analyticsService = new AnalyticsService();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/analytics/savings-tracker
router.get('/savings-tracker', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await analyticsService.getSavingsTracker((req.user as User).id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/cash-plan
router.get('/cash-plan', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await analyticsService.getCashPlan((req.user as User).id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/dashboard-stats
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await analyticsService.getDashboardStats((req.user as User).id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

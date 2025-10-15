import { Router } from 'express';
import { RatesService } from '../services/rates.service';

const router = Router();
const ratesService = new RatesService();

// GET /api/rates/today
router.get('/today', async (req, res, next) => {
  try {
    const rate = await ratesService.getToday();
    const asOfDate = rate.asOf instanceof Date ? rate.asOf : new Date(rate.asOf);
    res.json({
      asOf: asOfDate.toISOString().split('T')[0],
      benchmark: {
        name: rate.name,
        annualRatePct: rate.annualRatePct,
        deltaBpsDay: rate.deltaBpsDay,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

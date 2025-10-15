import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { DecisionsService } from '../services/decisions.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const decisionsService = new DecisionsService();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// POST /api/decisions
router.post('/', [
  body('invoiceIds').isArray().withMessage('Invoice IDs must be an array'),
  body('invoiceIds.*').isString().withMessage('Each invoice ID must be a string'),
  body('action').isIn(['APPROVE_TAKE', 'APPROVE_HOLD', 'DISMISS']).withMessage('Action must be APPROVE_TAKE, APPROVE_HOLD, or DISMISS'),
  body('note').optional().isString(),
], validateRequest, async (req, res, next) => {
  try {
    const { invoiceIds, action, note } = req.body;
    const result = await decisionsService.decide(req.user.id, invoiceIds, action, note);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/decisions/audit
router.get('/audit', [
  query('from').optional().isISO8601().withMessage('From date must be valid ISO 8601 date'),
  query('to').optional().isISO8601().withMessage('To date must be valid ISO 8601 date'),
], validateRequest, async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const result = await decisionsService.audit(req.user.id, from as string, to as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { InvoicesService } from '../services/invoices.service';
import { authenticateToken } from '../middleware/auth.middleware';
import logger from '../middleware/logger.middleware';
import { User } from '../types/user.types';

const router = Router();
const invoicesService = new InvoicesService();

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

// POST /api/invoices/import
router.post('/import', async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Debug log: request metadata
    logger.info(
      `Import request received: userId=${(req.user as User).id} filename=${req.file.originalname} size=${req.file.size} bytes mimetype=${req.file.mimetype}`
    );

    const result = await invoicesService.importCsv(req.file.buffer, (req.user as User).id);
    
    logger.info(
      `Import completed: userId=${(req.user as User).id} imported=${result.imported} skipped=${result.skipped}`
    );
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices
router.get('/', [
  query('status').optional().isIn(['PENDING', 'APPROVED_TAKE', 'APPROVED_HOLD', 'DISMISSED']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('cursor').optional().isString(),
], validateRequest, async (req, res, next) => {
  try {
    const { status, limit, cursor } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : 50;
    const result = await invoicesService.list({ status: status as string, limit: limitNum, cursor: cursor as string }, req.user.id);
    
    // Transform to match frontend expectations
    const items = result.items.map(invoice => ({
      id: invoice.id,
      vendor: invoice.vendor,
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.amount),
      currency: invoice.currency,
      invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      terms: invoice.terms,
      discountDeadline: invoice.discountDeadline?.toISOString().split('T')[0],
      impliedAprPct: invoice.impliedAprPct,
      recommendation: invoice.recommendation,
      reason: invoice.reason,
      status: invoice.status,
      userRate: invoice.userRate,
      rateType: invoice.rateType,
      borrowingCost: invoice.borrowingCost,
      investmentReturn: invoice.investmentReturn,
    }));

    res.json({ items, nextCursor: result.nextCursor });
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices/update-recommendations
router.post('/update-recommendations', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await invoicesService.updateRecommendations((req.user as User).id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/invoices/:id/rate
router.patch('/:id/rate', [
  param('id').isString().notEmpty(),
  body('userRate').isNumeric().withMessage('User rate must be a number'),
  body('rateType').isIn(['INVESTMENT', 'BORROWING']).withMessage('Rate type must be INVESTMENT or BORROWING'),
], validateRequest, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userRate, rateType } = req.body;
    const result = await invoicesService.updateInvoiceRate(id, userRate, rateType, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

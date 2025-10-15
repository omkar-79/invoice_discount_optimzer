import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ChatService } from '../services/chat.service';

const router = Router();
const chatService = new ChatService();

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

// POST /api/chat/explain-invoice
router.post('/explain-invoice', [
  body('invoiceId').notEmpty().withMessage('Invoice ID is required'),
], validateRequest, async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    const result = await chatService.explainInvoice(invoiceId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/chat/pick-top-discounts
router.post('/pick-top-discounts', [
  body('budget').isNumeric().withMessage('Budget must be a number'),
], validateRequest, async (req, res, next) => {
  try {
    const { budget } = req.body;
    const result = await chatService.pickTopDiscounts(Number(budget));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

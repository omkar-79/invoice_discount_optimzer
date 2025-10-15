import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { SettingsService, UserSettingsData } from '../services/settings.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const settingsService = new SettingsService();

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

// GET /settings
router.get('/', async (req, res, next) => {
  try {
    const result = await settingsService.getUserSettings(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /settings
router.put('/', [
  body('safetyBuffer').optional().isInt({ min: 0, max: 1000 }),
  body('defaultCurrency').optional().isString().isLength({ min: 3, max: 3 }),
  body('defaultInvestmentRate').optional().isFloat({ min: 0, max: 100 }),
  body('defaultBorrowingRate').optional().isFloat({ min: 0, max: 100 }),
  body('defaultRateType').optional().isIn(['INVESTMENT', 'BORROWING']),
  body('emailSummary').optional().isBoolean(),
  body('urgentDeadlineAlerts').optional().isBoolean(),
  body('rateChangeAlerts').optional().isBoolean(),
  body('twoFactorEnabled').optional().isBoolean(),
  body('sessionTimeout').optional().isInt({ min: 5, max: 480 }),
  body('organizationName').optional().isString().isLength({ max: 255 }),
  body('organizationDomain').optional().isString().isLength({ max: 255 }),
  body('organizationSize').optional().isIn(['small', 'medium', 'large', 'enterprise']),
], validateRequest, async (req, res, next) => {
  try {
    const data: UserSettingsData = req.body;
    const result = await settingsService.updateUserSettings(req.user.id, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// PUT /settings/profile
router.put('/profile', [
  body('name').optional().isString().isLength({ min: 1, max: 255 }),
  body('email').optional().isEmail(),
  body('company').optional().isString().isLength({ max: 255 }),
], validateRequest, async (req, res, next) => {
  try {
    const profileData = req.body;
    const result = await settingsService.updateProfile(req.user.id, profileData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /settings/change-password
router.post('/change-password', [
  body('currentPassword').isString().isLength({ min: 6 }),
  body('newPassword').isString().isLength({ min: 6 }),
], validateRequest, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await settingsService.changePassword(req.user.id, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

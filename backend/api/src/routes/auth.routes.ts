import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService, RegisterDto, LoginDto } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();
const authService = new AuthService();

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

// Register validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('company').optional().trim(),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, validateRequest, async (req, res, next) => {
  try {
    const registerDto: RegisterDto = req.body;
    const result = await authService.register(registerDto);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, validateRequest, async (req, res, next) => {
  try {
    const loginDto: LoginDto = req.body;
    const result = await authService.login(loginDto);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

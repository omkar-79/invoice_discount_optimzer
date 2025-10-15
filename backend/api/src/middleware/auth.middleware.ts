import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { AppError } from './error.middleware';
import { config } from '../config';
import '../types/user.types'; // Import to extend Express Request interface

// Configure JWT strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
  ignoreExpiration: false,
}, async (payload, done) => {
  try {
    const authService = new AuthService();
    const user = await authService.validateUser(payload.sub);
    
    if (!user) {
      return done(new AppError('User not found', 401), false);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(new AppError('Unauthorized', 401));
    }
    
    req.user = user;
    next();
  })(req, res, next);
};

export default passport;

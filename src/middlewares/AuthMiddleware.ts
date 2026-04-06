import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export class AuthMiddleware {
  static async requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // For web requests, check session or redirect to login
        if (req.session && req.session.userId) {
          const user = User.findById(req.session.userId);
          if (user) {
            req.user = {
              id: user.id!,
              username: user.username,
              email: user.email,
            };
            return next();
          }
        }
        
        // Check for cookie-based token
        const token = req.cookies?.token;
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
          const user = User.findById(decoded.userId);
          if (user) {
            req.user = {
              id: user.id!,
              username: user.username,
              email: user.email,
            };
            return next();
          }
        }
        
        // If it's an API request, return 401
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }
        
        // Redirect to login for web requests
        res.redirect('/auth/login');
        return;
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      const user = User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = {
        id: user.id!,
        username: user.username,
        email: user.email,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  static async optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        const user = User.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id!,
            username: user.username,
            email: user.email,
          };
        }
      } else if (req.cookies?.token) {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        
        const user = User.findById(decoded.userId);
        if (user) {
          req.user = {
            id: user.id!,
            username: user.username,
            email: user.email,
          };
        }
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
    
    next();
  }

  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  static decodeToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (error) {
      return null;
    }
  }
}

// Extend Express Request type for session support
declare global {
  namespace Express {
    interface Request {
      session?: {
        userId?: number;
      };
      cookies?: {
        token?: string;
      };
    }
  }
}

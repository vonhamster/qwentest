import { Request, Response } from 'express';
import { Controller, RouteConfig } from '../core/Controller';
import { User } from '../models/User';
import { AuthMiddleware, AuthRequest } from '../middlewares/AuthMiddleware';

export class AuthController extends Controller {
  getRoutes(): RouteConfig[] {
    return [
      { method: 'GET', path: '/login', action: 'login' },
      { method: 'POST', path: '/login', action: 'loginSubmit' },
      { method: 'GET', path: '/register', action: 'register' },
      { method: 'POST', path: '/register', action: 'registerSubmit' },
      { method: 'POST', path: '/logout', action: 'logout' },
      { method: 'GET', path: '/profile', action: 'profile', middleware: [AuthMiddleware.requireAuth] },
    ];
  }

  async login(): Promise<void> {
    if ((this.request as AuthRequest).user) {
      this.redirect('/');
      return;
    }
    
    this.render('auth/login', { 
      title: 'Login',
      error: ''
    });
  }

  async loginSubmit(): Promise<void> {
    const { username, password } = this.request.body;
    
    const user = User.findByUsername(username);
    
    if (!user || !user.validatePassword(password)) {
      this.render('auth/login', { 
        title: 'Login',
        error: 'Invalid username or password'
      });
      return;
    }

    const token = AuthMiddleware.generateToken(user.id!);
    
    // Set cookie for web requests
    this.response.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });
    
    // For API/mobile clients, also return token in response
    if (this.request.headers.accept?.includes('application/json')) {
      this.json({ 
        success: true, 
        token, 
        user: user.toJSON() 
      });
      return;
    }
    
    this.redirect('/');
  }

  async register(): Promise<void> {
    if ((this.request as AuthRequest).user) {
      this.redirect('/');
      return;
    }
    
    this.render('auth/register', { 
      title: 'Register',
      errors: {} as Record<string, string>
    });
  }

  async registerSubmit(): Promise<void> {
    const { username, email, password, password_confirm } = this.request.body;
    const errors: Record<string, string> = {};

    // Validation
    if (!username || username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!email || !email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }

    // Check if username or email already exists
    if (User.findByUsername(username)) {
      errors.username = 'Username already taken';
    }
    
    if (User.findByEmail(email)) {
      errors.email = 'Email already registered';
    }

    if (Object.keys(errors).length > 0) {
      this.render('auth/register', { 
        title: 'Register',
        errors
      });
      return;
    }

    // Create user
    const user = new User({
      username,
      email,
      password_hash: AuthMiddleware.hashPassword(password),
      status: 10
    });

    if (user.save()) {
      const token = AuthMiddleware.generateToken(user.id!);
      
      this.response.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
      });
      
      if (this.request.headers.accept?.includes('application/json')) {
        this.json({ 
          success: true, 
          token, 
          user: user.toJSON() 
        });
        return;
      }
      
      this.redirect('/');
    } else {
      this.render('auth/register', { 
        title: 'Register',
        errors: { general: 'Failed to create account' }
      });
    }
  }

  async logout(): Promise<void> {
    this.response.clearCookie('token');
    
    if (this.request.headers.accept?.includes('application/json')) {
      this.json({ success: true });
      return;
    }
    
    this.redirect('/');
  }

  async profile(): Promise<void> {
    const req = this.request as AuthRequest;
    this.render('auth/profile', { 
      title: 'Profile',
      user: req.user
    });
  }
}

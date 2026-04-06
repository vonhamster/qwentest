import express, { Application as ExpressApplication, Request, Response } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { DatabaseManager } from './config/database';
import { Router } from './core/Router';
import { ViewEngine } from './core/ViewEngine';
import { Controller } from './core/Controller';
import { SiteController } from './controllers/SiteController';
import { AuthController } from './controllers/AuthController';
import { PostController } from './controllers/PostController';

export class ApplicationClass {
  private app: ExpressApplication;
  private viewEngine: ViewEngine;
  private router: Router;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    
    // Initialize view engine
    const viewsPath = path.join(process.cwd(), 'views');
    const layoutsPath = path.join(process.cwd(), 'views', 'layouts');
    this.viewEngine = new ViewEngine(viewsPath, layoutsPath);
    
    // Set view engine reference in Controller
    (Controller as any).getViewEngine = () => this.viewEngine;
    
    // Initialize router
    this.router = new Router(this.app);
  }

  initialize(): void {
    // Middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    
    // Session middleware for auth state
    const session = require('express-session');
    this.app.use(session({
      secret: process.env.SESSION_SECRET || 'yii2-ts-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 
      }
    }));
    
    // Static files
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    
    // CORS for API/Tauri support
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });

    // Register controllers
    this.router.registerController(SiteController, '');
    this.router.registerController(AuthController, '/auth');
    this.router.registerController(PostController, '');
    
    // API routes (REST)
    this.router.registerRestController(PostController, '/api/posts');
  }

  start(): void {
    // Initialize database
    const dbManager = DatabaseManager.getInstance();
    dbManager.connect();
    dbManager.migrate();

    // Start server
    this.app.listen(this.port, () => {
      console.log(`\n===========================================`);
      console.log(`Yii2 TypeScript Analog Server`);
      console.log(`===========================================`);
      console.log(`Server running at: http://localhost:${this.port}`);
      console.log(`API endpoints:`);
      console.log(`  GET    /api/posts - List all posts`);
      console.log(`  GET    /api/posts/:id - Get post by ID`);
      console.log(`  POST   /api/posts - Create new post`);
      console.log(`  PUT    /api/posts/:id - Update post`);
      console.log(`  DELETE /api/posts/:id - Delete post`);
      console.log(`\nWeb routes:`);
      console.log(`  / - Home page`);
      console.log(`  /posts - All posts`);
      console.log(`  /auth/login - Login`);
      console.log(`  /auth/register - Register`);
      console.log(`===========================================\n`);
    });
  }

  stop(): void {
    // Close database connection
    const dbManager = DatabaseManager.getInstance();
    dbManager.close();
    
    console.log('Application stopped');
  }
}

// Export singleton instance
let appInstance: ApplicationClass | null = null;

export function createApp(port?: number): ApplicationClass {
  if (!appInstance) {
    appInstance = new ApplicationClass(port);
    appInstance.initialize();
  }
  return appInstance;
}

export function getApp(): ApplicationClass {
  if (!appInstance) {
    throw new Error('Application not initialized. Call createApp() first.');
  }
  return appInstance;
}

// Also export as Application for backward compatibility
export const Application = ApplicationClass;

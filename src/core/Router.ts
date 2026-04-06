import express, { Application, Request, Response, NextFunction } from 'express';
import { Controller, RouteConfig, Middleware } from './Controller';

export class Router {
  private app: Application;
  private routes: Map<string, Array<{ 
    method: string; 
    path: string; 
    handler: (req: Request, res: Response) => void;
  }>> = new Map();

  constructor(app: Application) {
    this.app = app;
  }

  registerController(controllerClass: new (req: Request, res: Response) => Controller, basePath: string): void {
    // Create a temporary instance to get routes
    const tempReq = {} as Request;
    const tempRes = {} as Response;
    const controller = new controllerClass(tempReq, tempRes);
    const routes = controller.getRoutes();

    routes.forEach(route => {
      const fullPath = `${basePath}${route.path}`;
      
      const handler = async (req: Request, res: Response) => {
        try {
          // Apply middleware if specified BEFORE creating controller
          if (route.middleware) {
            for (const mw of route.middleware) {
              await new Promise<void>((resolve, reject) => {
                mw(req, res, () => resolve());
              }).catch((error) => {
                throw error;
              });
            }
          }
          
          // Create fresh controller instance with actual req/res AFTER middleware
          const ctrl = new controllerClass(req, res);
          
          // Call the action method
          const actionMethod = route.action as keyof Controller;
          if (typeof ctrl[actionMethod] === 'function') {
            await (ctrl[actionMethod] as Function).call(ctrl);
          } else {
            res.status(404).send(`Action ${route.action} not found`);
          }
        } catch (error) {
          console.error('Controller error:', error);
          res.status(500).send('Internal Server Error');
        }
      };

      // Register route based on HTTP method
      switch (route.method) {
        case 'GET':
          this.app.get(fullPath, handler);
          break;
        case 'POST':
          this.app.post(fullPath, handler);
          break;
        case 'PUT':
          this.app.put(fullPath, handler);
          break;
        case 'DELETE':
          this.app.delete(fullPath, handler);
          break;
        case 'PATCH':
          this.app.patch(fullPath, handler);
          break;
        case 'OPTIONS':
          this.app.options(fullPath, handler);
          break;
      }

      console.log(`Registered route: ${route.method} ${fullPath} -> ${route.action}`);
    });
  }

  // Add REST API routes for a controller
  registerRestController(controllerClass: new (req: Request, res: Response) => Controller, basePath: string): void {
    const actions = ['index', 'view', 'create', 'update', 'delete'];
    
    const restRoutes: RouteConfig[] = [
      { method: 'GET', path: basePath, action: 'index' },
      { method: 'GET', path: `${basePath}/:id`, action: 'view' },
      { method: 'POST', path: basePath, action: 'create' },
      { method: 'PUT', path: `${basePath}/:id`, action: 'update' },
      { method: 'DELETE', path: `${basePath}/:id`, action: 'delete' },
    ];

    restRoutes.forEach(route => {
      const handler = async (req: Request, res: Response) => {
        try {
          const ctrl = new controllerClass(req, res);
          const actionMethod = route.action as keyof Controller;
          if (typeof ctrl[actionMethod] === 'function') {
            await (ctrl[actionMethod] as Function).call(ctrl);
          } else {
            res.status(404).json({ error: `Action ${route.action} not found` });
          }
        } catch (error) {
          console.error('REST API error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };

      switch (route.method) {
        case 'GET':
          this.app.get(route.path, handler);
          break;
        case 'POST':
          this.app.post(route.path, handler);
          break;
        case 'PUT':
          this.app.put(route.path, handler);
          break;
        case 'DELETE':
          this.app.delete(route.path, handler);
          break;
      }

      console.log(`Registered REST route: ${route.method} ${route.path}`);
    });
  }
}

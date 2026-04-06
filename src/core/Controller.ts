import { Request, Response, NextFunction } from 'express';

export interface RouteConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  path: string;
  action: string;
  middleware?: Middleware[];
}

export type Middleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ControllerConfig {
  basePath: string;
  routes: RouteConfig[];
}

export abstract class Controller {
  protected request: Request;
  protected response: Response;
  
  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
  }

  abstract getRoutes(): RouteConfig[];
  
  protected render(view: string, data: Record<string, any> = {}): void {
    const viewEngine = (this.constructor as typeof Controller).getViewEngine();
    const html = viewEngine.render(view, data);
    this.response.send(html);
  }

  protected json(data: any): void {
    this.response.json(data);
  }

  protected redirect(url: string): void {
    this.response.redirect(url);
  }

  static getViewEngine(): any {
    // This will be overridden by the application
    return null;
  }
}

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
export declare abstract class Controller {
    protected request: Request;
    protected response: Response;
    constructor(request: Request, response: Response);
    abstract getRoutes(): RouteConfig[];
    protected render(view: string, data?: Record<string, any>): void;
    protected json(data: any): void;
    protected redirect(url: string): void;
    static getViewEngine(): any;
}
//# sourceMappingURL=Controller.d.ts.map
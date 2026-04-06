import { Application, Request, Response } from 'express';
import { Controller } from './Controller';
export declare class Router {
    private app;
    private routes;
    constructor(app: Application);
    registerController(controllerClass: new (req: Request, res: Response) => Controller, basePath: string): void;
    registerRestController(controllerClass: new (req: Request, res: Response) => Controller, basePath: string): void;
}
//# sourceMappingURL=Router.d.ts.map
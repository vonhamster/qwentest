import { Controller, RouteConfig } from '../core/Controller';
export declare class AuthController extends Controller {
    getRoutes(): RouteConfig[];
    login(): Promise<void>;
    loginSubmit(): Promise<void>;
    register(): Promise<void>;
    registerSubmit(): Promise<void>;
    logout(): Promise<void>;
    profile(): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map
import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
    };
}
export declare class AuthMiddleware {
    static requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static hashPassword(password: string): string;
    static verifyPassword(password: string, hash: string): boolean;
    static generateToken(userId: number): string;
    static decodeToken(token: string): {
        userId: number;
    } | null;
}
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
//# sourceMappingURL=AuthMiddleware.d.ts.map
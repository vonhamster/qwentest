"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';
class AuthMiddleware {
    static async requireAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // For web requests, check session or redirect to login
                if (req.session && req.session.userId) {
                    const user = User_1.User.findById(req.session.userId);
                    if (user) {
                        req.user = {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                        };
                        return next();
                    }
                }
                // Check for cookie-based token
                const token = req.cookies?.token;
                if (token) {
                    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    const user = User_1.User.findById(decoded.userId);
                    if (user) {
                        req.user = {
                            id: user.id,
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
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = User_1.User.findById(decoded.userId);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    static async optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                const user = User_1.User.findById(decoded.userId);
                if (user) {
                    req.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    };
                }
            }
            else if (req.cookies?.token) {
                const token = req.cookies.token;
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                const user = User_1.User.findById(decoded.userId);
                if (user) {
                    req.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                    };
                }
            }
        }
        catch (error) {
            // Ignore errors for optional auth
        }
        next();
    }
    static hashPassword(password) {
        return bcryptjs_1.default.hashSync(password, 10);
    }
    static verifyPassword(password, hash) {
        return bcryptjs_1.default.compareSync(password, hash);
    }
    static generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    }
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const Controller_1 = require("../core/Controller");
const User_1 = require("../models/User");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
class AuthController extends Controller_1.Controller {
    getRoutes() {
        return [
            { method: 'GET', path: '/login', action: 'login' },
            { method: 'POST', path: '/login', action: 'loginSubmit' },
            { method: 'GET', path: '/register', action: 'register' },
            { method: 'POST', path: '/register', action: 'registerSubmit' },
            { method: 'POST', path: '/logout', action: 'logout' },
            { method: 'GET', path: '/profile', action: 'profile', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
        ];
    }
    async login() {
        if (this.request.user) {
            this.redirect('/');
            return;
        }
        this.render('auth/login', {
            title: 'Login',
            error: ''
        });
    }
    async loginSubmit() {
        const { username, password } = this.request.body;
        const user = User_1.User.findByUsername(username);
        if (!user || !user.validatePassword(password)) {
            this.render('auth/login', {
                title: 'Login',
                error: 'Invalid username or password'
            });
            return;
        }
        const token = AuthMiddleware_1.AuthMiddleware.generateToken(user.id);
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
    async register() {
        if (this.request.user) {
            this.redirect('/');
            return;
        }
        this.render('auth/register', {
            title: 'Register',
            errors: {}
        });
    }
    async registerSubmit() {
        const { username, email, password, password_confirm } = this.request.body;
        const errors = {};
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
        if (User_1.User.findByUsername(username)) {
            errors.username = 'Username already taken';
        }
        if (User_1.User.findByEmail(email)) {
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
        const user = new User_1.User({
            username,
            email,
            password_hash: AuthMiddleware_1.AuthMiddleware.hashPassword(password),
            status: 10
        });
        if (user.save()) {
            const token = AuthMiddleware_1.AuthMiddleware.generateToken(user.id);
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
        }
        else {
            this.render('auth/register', {
                title: 'Register',
                errors: { general: 'Failed to create account' }
            });
        }
    }
    async logout() {
        this.response.clearCookie('token');
        if (this.request.headers.accept?.includes('application/json')) {
            this.json({ success: true });
            return;
        }
        this.redirect('/');
    }
    async profile() {
        const req = this.request;
        this.render('auth/profile', {
            title: 'Profile',
            user: req.user
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map
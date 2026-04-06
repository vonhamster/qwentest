"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = exports.ApplicationClass = void 0;
exports.createApp = createApp;
exports.getApp = getApp;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./config/database");
const Router_1 = require("./core/Router");
const ViewEngine_1 = require("./core/ViewEngine");
const Controller_1 = require("./core/Controller");
const SiteController_1 = require("./controllers/SiteController");
const AuthController_1 = require("./controllers/AuthController");
const PostController_1 = require("./controllers/PostController");
class ApplicationClass {
    constructor(port = 3000) {
        this.port = port;
        this.app = (0, express_1.default)();
        // Initialize view engine
        const viewsPath = path_1.default.join(process.cwd(), 'views');
        const layoutsPath = path_1.default.join(process.cwd(), 'views', 'layouts');
        this.viewEngine = new ViewEngine_1.ViewEngine(viewsPath, layoutsPath);
        // Set view engine reference in Controller
        Controller_1.Controller.getViewEngine = () => this.viewEngine;
        // Initialize router
        this.router = new Router_1.Router(this.app);
    }
    initialize() {
        // Middleware
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cookie_parser_1.default)());
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
        this.app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
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
        this.router.registerController(SiteController_1.SiteController, '');
        this.router.registerController(AuthController_1.AuthController, '/auth');
        this.router.registerController(PostController_1.PostController, '');
        // API routes (REST)
        this.router.registerRestController(PostController_1.PostController, '/api/posts');
    }
    start() {
        // Initialize database
        const dbManager = database_1.DatabaseManager.getInstance();
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
    stop() {
        // Close database connection
        const dbManager = database_1.DatabaseManager.getInstance();
        dbManager.close();
        console.log('Application stopped');
    }
}
exports.ApplicationClass = ApplicationClass;
// Export singleton instance
let appInstance = null;
function createApp(port) {
    if (!appInstance) {
        appInstance = new ApplicationClass(port);
        appInstance.initialize();
    }
    return appInstance;
}
function getApp() {
    if (!appInstance) {
        throw new Error('Application not initialized. Call createApp() first.');
    }
    return appInstance;
}
// Also export as Application for backward compatibility
exports.Application = ApplicationClass;
//# sourceMappingURL=Application.js.map
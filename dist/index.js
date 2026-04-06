#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = require("./Application");
// Create and start the application
const app = (0, Application_1.createApp)(3000);
app.start();
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    app.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    app.stop();
    process.exit(0);
});
//# sourceMappingURL=index.js.map
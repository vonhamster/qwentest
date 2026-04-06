#!/usr/bin/env node

import { createApp } from './Application';

// Create and start the application
const app = createApp(3000);
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

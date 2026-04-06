# Yii2 Analog in TypeScript

A modern TypeScript implementation of a Yii2-like MVC framework with SQLite database, REST API support, JWT authentication, and Bootstrap 5 UI. Optimized for Tauri Android deployment.

## Features

- **MVC Architecture**: Router, Controllers, Models, and Views
- **Active Record Pattern**: Database ORM using SQLite (better-sqlite3)
- **View Engine**: HTML template loading from files with variable injection
- **REST API Support**: JSON responses for API endpoints
- **JWT Authentication**: User registration, login, and authorization
- **Bootstrap 5**: Modern responsive UI components
- **Tauri Ready**: Optimized for Android mobile deployment

## Project Structure

```
/workspace
├── src/
│   ├── Application.ts      # Main application setup
│   ├── index.ts            # Entry point
│   ├── core/               # Core framework classes
│   │   ├── Router.ts       # URL routing
│   │   ├── Controller.ts   # Base controller
│   │   ├── Model.ts        # Active Record base
│   │   └── View.ts         # Template engine
│   ├── controllers/        # Application controllers
│   ├── models/             # Database models
│   ├── middlewares/        # Request middlewares
│   └── config/             # Configuration files
├── views/                  # HTML templates
│   ├── layouts/            # Layout templates
│   ├── site/               # Site views
│   ├── auth/               # Authentication views
│   └── post/               # Post views
├── public/                 # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- For Tauri Android: Rust, Android SDK, and Tauri CLI

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Build TypeScript

```bash
# Compile TypeScript to JavaScript
npx tsc
```

Or build in watch mode for development:

```bash
npx tsc --watch
```

## Running the Application

### Development Mode

Run directly with ts-node (no compilation needed):

```bash
npx ts-node src/index.ts
```

### Production Mode

After compiling with `npx tsc`:

```bash
node dist/index.js
```

The server will start on `http://localhost:3000` by default.

## Available Scripts

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "watch": "tsc --watch",
    "migrate": "ts-node src/models/migrate.ts"
  }
}
```

Then run:

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Setup

The application uses SQLite with automatic migration. The database file is created at runtime.

To run migrations manually:

```bash
npx ts-node src/models/migrate.ts
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout (invalidate token) |
| GET | `/api/auth/me` | Get current user profile |

### Posts (Example Resource)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create new post (auth required) |
| PUT | `/api/posts/:id` | Update post (auth required) |
| DELETE | `/api/posts/:id` | Delete post (auth required) |

### Web Pages

| URL | Description |
|-----|-------------|
| `/` | Home page |
| `/login` | Login page |
| `/register` | Registration page |
| `/posts` | Posts list |
| `/posts/create` | Create post form |

## Authentication

The framework uses JWT (JSON Web Tokens) for authentication.

### Using API with Authentication

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"secret123"}'
```

2. **Login to get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"secret123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "testuser", "email": "test@example.com" }
}
```

3. **Use token for authenticated requests:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Tauri Android Setup

### 1. Install Tauri CLI

```bash
npm install -D @tauri-apps/cli
```

### 2. Initialize Tauri (if not already done)

```bash
npx tauri init
```

### 3. Configure for Android

Update `tauri.conf.json`:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "tauri": {
    "bundle": {
      "android": {
        "minSdkVersion": 24
      }
    }
  }
}
```

### 4. Add Android Target

```bash
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add i686-linux-android
rustup target add x86_64-linux-android
```

### 5. Build for Android

```bash
# Development build
npx tauri android dev

# Production build
npx tauri android build
```

### 6. Requirements for Android

- **Android Studio** with SDK tools
- **Java JDK** 11 or higher
- **Rust** with Android targets
- **Environment variables**:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  ```

## Configuration

Edit `src/config/database.ts` for database settings:

```typescript
export const dbConfig = {
  path: './data/app.db',  // SQLite database path
  migrate: true           // Auto-run migrations on startup
};
```

Edit `src/config/auth.ts` for JWT settings:

```typescript
export const authConfig = {
  secret: 'your-secret-key-change-in-production',
  expiresIn: '24h',
  issuer: 'yii2-ts-app'
};
```

## Creating New Components

### New Controller

```typescript
// src/controllers/MyController.ts
import { Controller } from '../core/Controller';
import { Request, Response } from 'express';

export class MyController extends Controller {
  async index(req: Request, res: Response) {
    this.render(res, 'my/index', { title: 'My Page' });
  }
  
  async apiList(req: Request, res: Response) {
    this.json(res, { data: [] });
  }
}
```

### New Model

```typescript
// src/models/MyModel.ts
import { Model } from '../core/Model';

export class MyModel extends Model {
  static tableName = 'my_table';
  
  id!: number;
  name!: string;
  
  static createTable(db: Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
  }
}
```

### New View Template

```html
<!-- views/my/index.html -->
{% extends "layouts/main.html" %}

{% block content %}
<div class="container">
  <h1>{{ title }}</h1>
  <p>Welcome to my page!</p>
</div>
{% endblock %}
```

## Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy, change it in `src/index.ts`:

```typescript
const app = createApp(3001); // Use different port
```

### Database Errors

Delete the database file to reset:

```bash
rm ./data/app.db
npx ts-node src/models/migrate.ts
```

### TypeScript Compilation Errors

Ensure all dependencies are installed:

```bash
npm install
npx tsc --noEmit
```

## License

ISC

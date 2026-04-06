import Database from 'better-sqlite3';
import path from 'path';
import { ActiveRecord } from './core/ActiveRecord';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;
  private dbPath: string;

  private constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'app.db');
  }

  static getInstance(dbPath?: string): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(dbPath);
    }
    return DatabaseManager.instance;
  }

  connect(): void {
    const fs = require('fs');
    const dir = path.dirname(this.dbPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    
    // Set the database instance for all ActiveRecord models
    ActiveRecord.setDb(this.db);
    
    console.log(`Database connected: ${this.dbPath}`);
  }

  getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  migrate(): void {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    console.log('Running migrations...');

    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        auth_key TEXT,
        status INTEGER DEFAULT 10,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        status INTEGER DEFAULT 10,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    `);

    // Create default admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminExists = this.db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    
    if (!adminExists) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      this.db.prepare(`
        INSERT INTO users (username, email, password_hash, status)
        VALUES (?, ?, ?, 10)
      `).run('admin', 'admin@example.com', passwordHash);
      
      console.log('Default admin user created (username: admin, password: admin123)');
    }

    // Create sample posts if none exist
    const postCount = this.db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
    
    if (postCount.count === 0) {
      const admin = this.db.prepare('SELECT id FROM users WHERE username = ?').get('admin') as { id: number };
      
      this.db.prepare(`
        INSERT INTO posts (title, content, author_id, status)
        VALUES (?, ?, ?, 10)
      `).run(
        'Welcome to Yii2 TypeScript Analog',
        'This is a sample post demonstrating the framework capabilities. Built with TypeScript, Express, and SQLite.',
        admin.id
      );

      this.db.prepare(`
        INSERT INTO posts (title, content, author_id, status)
        VALUES (?, ?, ?, 10)
      `).run(
        'Features Overview',
        'This framework includes: ActiveRecord ORM, MVC architecture, REST API support, Authentication, View templates, and Bootstrap 5 integration.',
        admin.id
      );

      console.log('Sample posts created');
    }

    console.log('Migrations completed successfully');
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('Database connection closed');
    }
  }
}

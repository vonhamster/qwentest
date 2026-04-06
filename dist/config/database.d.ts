import Database from 'better-sqlite3';
export declare class DatabaseManager {
    private static instance;
    private db;
    private dbPath;
    private constructor();
    static getInstance(dbPath?: string): DatabaseManager;
    connect(): void;
    getDb(): Database.Database;
    migrate(): void;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map
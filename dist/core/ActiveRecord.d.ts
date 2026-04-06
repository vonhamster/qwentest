import Database from 'better-sqlite3';
export declare class ActiveRecord {
    protected static db: Database.Database;
    protected static tableName: string;
    id?: number;
    created_at?: string;
    updated_at?: string;
    constructor(data?: Record<string, any>);
    static setDb(db: Database.Database): void;
    static getDb(): Database.Database;
    static getTableName(): string;
    static findOne(condition: Record<string, any>): ActiveRecord | null;
    static findAll(condition?: Record<string, any>, orderBy?: string, limit?: number): ActiveRecord[];
    static findById(id: number): ActiveRecord | null;
    save(): boolean;
    delete(): boolean;
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=ActiveRecord.d.ts.map
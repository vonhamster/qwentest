"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveRecord = void 0;
class ActiveRecord {
    constructor(data) {
        if (data) {
            Object.assign(this, data);
        }
    }
    static setDb(db) {
        this.db = db;
    }
    static getDb() {
        if (!this.db) {
            throw new Error('Database not initialized. Call ActiveRecord.setDb() first.');
        }
        return this.db;
    }
    static getTableName() {
        if (!this.tableName) {
            throw new Error('tableName must be defined in the model class');
        }
        return this.tableName;
    }
    static findOne(condition) {
        const table = this.getTableName();
        const keys = Object.keys(condition);
        const values = Object.values(condition);
        if (keys.length === 0) {
            const row = this.getDb().prepare(`SELECT * FROM ${table} LIMIT 1`).get();
            return row ? new this(row) : null;
        }
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
        const row = this.getDb().prepare(query).get(...values);
        return row ? new this(row) : null;
    }
    static findAll(condition, orderBy, limit) {
        const table = this.getTableName();
        let query = `SELECT * FROM ${table}`;
        const values = [];
        if (condition && Object.keys(condition).length > 0) {
            const keys = Object.keys(condition);
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            query += ` WHERE ${whereClause}`;
            values.push(...Object.values(condition));
        }
        if (orderBy) {
            query += ` ORDER BY ${orderBy}`;
        }
        if (limit) {
            query += ` LIMIT ?`;
            values.push(limit);
        }
        const rows = this.getDb().prepare(query).all(...values);
        return rows.map(row => new this(row));
    }
    static findById(id) {
        return this.findOne({ id });
    }
    save() {
        const table = this.constructor.getTableName();
        const db = this.constructor.getDb();
        try {
            if (this.id) {
                // Update existing record
                const fields = Object.keys(this).filter(key => key !== 'id' && key !== 'created_at' && !key.startsWith('_'));
                const updateFields = fields.map(key => `${key} = ?`).join(', ');
                const updatedAt = new Date().toISOString();
                const query = `UPDATE ${table} SET ${updateFields}, updated_at = ? WHERE id = ?`;
                const values = [
                    ...fields.map(key => this[key]),
                    updatedAt,
                    this.id
                ];
                db.prepare(query).run(...values);
                this.updated_at = updatedAt;
            }
            else {
                // Insert new record
                const fields = Object.keys(this).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && !key.startsWith('_'));
                const fieldNames = fields.join(', ');
                const placeholders = fields.map(() => '?').join(', ');
                const createdAt = new Date().toISOString();
                const updatedAt = createdAt;
                const query = `INSERT INTO ${table} (${fieldNames}, created_at, updated_at) VALUES (${placeholders}, ?, ?)`;
                const values = [
                    ...fields.map(key => this[key]),
                    createdAt,
                    updatedAt
                ];
                const result = db.prepare(query).run(...values);
                this.id = result.lastInsertRowid;
                this.created_at = createdAt;
                this.updated_at = updatedAt;
            }
            return true;
        }
        catch (error) {
            console.error('Error saving record:', error);
            return false;
        }
    }
    delete() {
        if (!this.id) {
            return false;
        }
        const table = this.constructor.getTableName();
        const db = this.constructor.getDb();
        try {
            db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(this.id);
            return true;
        }
        catch (error) {
            console.error('Error deleting record:', error);
            return false;
        }
    }
    toJSON() {
        const result = {};
        for (const key in this) {
            if (this.hasOwnProperty(key) && !key.startsWith('_')) {
                result[key] = this[key];
            }
        }
        return result;
    }
}
exports.ActiveRecord = ActiveRecord;
//# sourceMappingURL=ActiveRecord.js.map
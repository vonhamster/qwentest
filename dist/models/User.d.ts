import { ActiveRecord } from '../core/ActiveRecord';
export declare class User extends ActiveRecord {
    protected static tableName: string;
    username: string;
    email: string;
    password_hash: string;
    auth_key?: string;
    status: number;
    constructor(data?: Record<string, any>);
    validatePassword(password: string): boolean;
    static findByUsername(username: string): User | null;
    static findByEmail(email: string): User | null;
    toJSON(): Record<string, any>;
}
//# sourceMappingURL=User.d.ts.map
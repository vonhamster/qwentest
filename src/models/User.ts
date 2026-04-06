import { ActiveRecord } from '../core/ActiveRecord';

export class User extends ActiveRecord {
  protected static tableName = 'users';
  
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public auth_key?: string;
  public status: number = 10; // 10 = active, 0 = inactive
  
  constructor(data?: Record<string, any>) {
    super(data);
    if (data) {
      Object.assign(this, data);
    }
  }

  validatePassword(password: string): boolean {
    const bcrypt = require('bcryptjs');
    return bcrypt.compareSync(password, this.password_hash);
  }

  static findByUsername(username: string): User | null {
    return this.findOne({ username }) as User | null;
  }

  static findByEmail(email: string): User | null {
    return this.findOne({ email }) as User | null;
  }

  toJSON(): Record<string, any> {
    const data = super.toJSON();
    // Remove sensitive data
    delete data.password_hash;
    delete data.auth_key;
    return data;
  }
}

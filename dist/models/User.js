"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const ActiveRecord_1 = require("../core/ActiveRecord");
class User extends ActiveRecord_1.ActiveRecord {
    constructor(data) {
        super(data);
        this.status = 10; // 10 = active, 0 = inactive
        if (data) {
            Object.assign(this, data);
        }
    }
    validatePassword(password) {
        const bcrypt = require('bcryptjs');
        return bcrypt.compareSync(password, this.password_hash);
    }
    static findByUsername(username) {
        return this.findOne({ username });
    }
    static findByEmail(email) {
        return this.findOne({ email });
    }
    toJSON() {
        const data = super.toJSON();
        // Remove sensitive data
        delete data.password_hash;
        delete data.auth_key;
        return data;
    }
}
exports.User = User;
User.tableName = 'users';
//# sourceMappingURL=User.js.map
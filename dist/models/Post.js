"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const ActiveRecord_1 = require("../core/ActiveRecord");
class Post extends ActiveRecord_1.ActiveRecord {
    constructor(data) {
        super(data);
        this.status = 10; // 10 = published, 0 = draft
        if (data) {
            Object.assign(this, data);
        }
    }
    static findByAuthor(authorId) {
        return this.findAll({ author_id: authorId }, 'created_at DESC');
    }
    static findPublished() {
        return this.findAll({ status: 10 }, 'created_at DESC');
    }
}
exports.Post = Post;
Post.tableName = 'posts';
//# sourceMappingURL=Post.js.map
import { ActiveRecord } from '../core/ActiveRecord';
export declare class Post extends ActiveRecord {
    protected static tableName: string;
    title: string;
    content: string;
    author_id: number;
    status: number;
    constructor(data?: Record<string, any>);
    static findByAuthor(authorId: number): Post[];
    static findPublished(): Post[];
}
//# sourceMappingURL=Post.d.ts.map
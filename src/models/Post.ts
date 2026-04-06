import { ActiveRecord } from '../core/ActiveRecord';

export class Post extends ActiveRecord {
  protected static tableName = 'posts';
  
  public title!: string;
  public content!: string;
  public author_id!: number;
  public status: number = 10; // 10 = published, 0 = draft
  
  constructor(data?: Record<string, any>) {
    super(data);
    if (data) {
      Object.assign(this, data);
    }
  }

  static findByAuthor(authorId: number): Post[] {
    return this.findAll({ author_id: authorId }, 'created_at DESC') as Post[];
  }

  static findPublished(): Post[] {
    return this.findAll({ status: 10 }, 'created_at DESC') as Post[];
  }
}

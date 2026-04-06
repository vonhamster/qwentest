import { Request, Response } from 'express';
import { Controller, RouteConfig } from '../core/Controller';
import { Post } from '../models/Post';
import { AuthMiddleware, AuthRequest } from '../middlewares/AuthMiddleware';

export class PostController extends Controller {
  getRoutes(): RouteConfig[] {
    return [
      { method: 'GET', path: '/posts', action: 'index' },
      { method: 'GET', path: '/posts/:id', action: 'view' },
      { method: 'GET', path: '/posts/create', action: 'create', middleware: [AuthMiddleware.requireAuth] },
      { method: 'POST', path: '/posts', action: 'store', middleware: [AuthMiddleware.requireAuth] },
      { method: 'GET', path: '/posts/:id/update', action: 'updateForm', middleware: [AuthMiddleware.requireAuth] },
      { method: 'PUT', path: '/posts/:id', action: 'update', middleware: [AuthMiddleware.requireAuth] },
      { method: 'DELETE', path: '/posts/:id', action: 'delete', middleware: [AuthMiddleware.requireAuth] },
    ];
  }

  async index(): Promise<void> {
    const posts = Post.findAll({}, 'created_at DESC');
    this.render('post/index', { 
      title: 'All Posts',
      posts: posts.map(p => p.toJSON()),
      currentUser: (this.request as AuthRequest).user
    });
  }

  async view(): Promise<void> {
    const id = parseInt(this.request.params.id as string);
    const post = Post.findById(id) as Post | null;
    
    if (!post) {
      this.response.status(404).send('Post not found');
      return;
    }
    
    this.render('post/view', { 
      title: post.title,
      post: post.toJSON(),
      currentUser: (this.request as AuthRequest).user
    });
  }

  async create(): Promise<void> {
    this.render('post/form', { 
      title: 'Create Post',
      post: { title: '', content: '' },
      action: '/posts',
      method: 'POST',
      currentUser: (this.request as AuthRequest).user
    });
  }

  async store(): Promise<void> {
    const req = this.request as AuthRequest;
    const { title, content } = this.request.body;
    
    const post = new Post({
      title,
      content,
      author_id: req.user?.id || 0,
      status: 10
    });

    if (post.save()) {
      this.redirect(`/posts/${post.id}`);
    } else {
      this.render('post/form', { 
        title: 'Create Post',
        post: { title, content },
        action: '/posts',
        method: 'POST',
        error: 'Failed to create post',
        currentUser: req.user
      });
    }
  }

  async updateForm(): Promise<void> {
    const id = parseInt(this.request.params.id as string);
    const post = Post.findById(id);
    
    if (!post) {
      this.response.status(404).send('Post not found');
      return;
    }
    
    this.render('post/form', { 
      title: 'Update Post',
      post: post.toJSON(),
      action: `/posts/${id}`,
      method: 'PUT',
      currentUser: (this.request as AuthRequest).user
    });
  }

  async update(): Promise<void> {
    const id = parseInt(this.request.params.id as string);
    const post = Post.findById(id) as Post | null;
    
    if (!post) {
      this.response.status(404).json({ error: 'Post not found' });
      return;
    }

    const { title, content, status } = this.request.body;
    post.title = title;
    post.content = content;
    if (status !== undefined) {
      post.status = parseInt(status);
    }

    if (post.save()) {
      if (this.request.headers.accept?.includes('application/json')) {
        this.json(post.toJSON());
      } else {
        this.redirect(`/posts/${post.id}`);
      }
    } else {
      if (this.request.headers.accept?.includes('application/json')) {
        this.response.status(500).json({ error: 'Failed to update post' });
      } else {
        this.render('post/form', { 
          title: 'Update Post',
          post: post.toJSON(),
          action: `/posts/${id}`,
          method: 'PUT',
          error: 'Failed to update post',
          currentUser: (this.request as AuthRequest).user
        });
      }
    }
  }

  async delete(): Promise<void> {
    const id = parseInt(this.request.params.id as string);
    const post = Post.findById(id) as Post | null;
    
    if (!post) {
      this.response.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.delete()) {
      if (this.request.headers.accept?.includes('application/json')) {
        this.json({ success: true });
      } else {
        this.redirect('/posts');
      }
    } else {
      if (this.request.headers.accept?.includes('application/json')) {
        this.response.status(500).json({ error: 'Failed to delete post' });
      } else {
        this.response.status(500).send('Failed to delete post');
      }
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const Controller_1 = require("../core/Controller");
const Post_1 = require("../models/Post");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
class PostController extends Controller_1.Controller {
    getRoutes() {
        return [
            { method: 'GET', path: '/posts/create', action: 'create', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
            { method: 'GET', path: '/posts', action: 'index' },
            { method: 'GET', path: '/posts/:id/view', action: 'view' },
            { method: 'POST', path: '/posts', action: 'store', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
            { method: 'GET', path: '/posts/:id/update', action: 'updateForm', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
            { method: 'PUT', path: '/posts/:id', action: 'update', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
            { method: 'DELETE', path: '/posts/:id', action: 'delete', middleware: [AuthMiddleware_1.AuthMiddleware.requireAuth] },
            { method: 'GET', path: '/posts/:id', action: 'view' },
        ];
    }
    async index() {
        const posts = Post_1.Post.findAll({}, 'created_at DESC');
        this.render('post/index', {
            title: 'All Posts',
            posts: posts.map(p => p.toJSON()),
            currentUser: this.request.user,
            isPosts: true,
            showFab: true
        });
    }
    async view() {
        const id = parseInt(this.request.params.id);
        const post = Post_1.Post.findById(id);
        if (!post) {
            this.response.status(404).send('Post not found');
            return;
        }
        this.render('post/view', {
            title: post.title,
            post: post.toJSON(),
            currentUser: this.request.user,
            isPosts: true,
            showFab: false
        });
    }
    async create() {
        this.render('post/form', {
            title: 'Create Post',
            post: { title: '', content: '' },
            action: '/posts',
            method: 'POST',
            currentUser: this.request.user,
            isPosts: true,
            showFab: false
        });
    }
    async store() {
        const req = this.request;
        const { title, content } = this.request.body;
        const post = new Post_1.Post({
            title,
            content,
            author_id: req.user?.id || 0,
            status: 10
        });
        if (post.save()) {
            this.redirect(`/posts/${post.id}`);
        }
        else {
            this.render('post/form', {
                title: 'Create Post',
                post: { title, content },
                action: '/posts',
                method: 'POST',
                error: 'Failed to create post',
                currentUser: req.user,
                isPosts: true,
                showFab: false
            });
        }
    }
    async updateForm() {
        const id = parseInt(this.request.params.id);
        const post = Post_1.Post.findById(id);
        if (!post) {
            this.response.status(404).send('Post not found');
            return;
        }
        this.render('post/form', {
            title: 'Update Post',
            post: post.toJSON(),
            action: `/posts/${id}`,
            method: 'PUT',
            currentUser: this.request.user,
            isPosts: true,
            showFab: false
        });
    }
    async update() {
        const id = parseInt(this.request.params.id);
        const post = Post_1.Post.findById(id);
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
            }
            else {
                this.redirect(`/posts/${post.id}`);
            }
        }
        else {
            if (this.request.headers.accept?.includes('application/json')) {
                this.response.status(500).json({ error: 'Failed to update post' });
            }
            else {
                this.render('post/form', {
                    title: 'Update Post',
                    post: post.toJSON(),
                    action: `/posts/${id}`,
                    method: 'PUT',
                    error: 'Failed to update post',
                    currentUser: this.request.user,
                    isPosts: true,
                    showFab: false
                });
            }
        }
    }
    async delete() {
        const id = parseInt(this.request.params.id);
        const post = Post_1.Post.findById(id);
        if (!post) {
            this.response.status(404).json({ error: 'Post not found' });
            return;
        }
        if (post.delete()) {
            if (this.request.headers.accept?.includes('application/json')) {
                this.json({ success: true });
            }
            else {
                this.redirect('/posts');
            }
        }
        else {
            if (this.request.headers.accept?.includes('application/json')) {
                this.response.status(500).json({ error: 'Failed to delete post' });
            }
            else {
                this.response.status(500).send('Failed to delete post');
            }
        }
    }
}
exports.PostController = PostController;
//# sourceMappingURL=PostController.js.map
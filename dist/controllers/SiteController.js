"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteController = void 0;
const Controller_1 = require("../core/Controller");
const Post_1 = require("../models/Post");
class SiteController extends Controller_1.Controller {
    getRoutes() {
        return [
            { method: 'GET', path: '/', action: 'index' },
            { method: 'GET', path: '/about', action: 'about' },
            { method: 'GET', path: '/contact', action: 'contact' },
            { method: 'POST', path: '/contact', action: 'contactSubmit' },
        ];
    }
    async index() {
        const posts = Post_1.Post.findPublished();
        this.render('site/index', {
            title: 'Home',
            posts: posts.map(p => p.toJSON()),
            currentUser: this.request.user,
            isHome: true,
            showFab: true
        });
    }
    async about() {
        this.render('site/about', {
            title: 'About Us',
            currentUser: this.request.user,
            isAbout: true,
            showFab: false
        });
    }
    async contact() {
        this.render('site/contact', {
            title: 'Contact',
            message: '',
            currentUser: this.request.user,
            isContact: true,
            showFab: false
        });
    }
    async contactSubmit() {
        const { name, email, message } = this.request.body;
        // Here you would typically save the message or send an email
        console.log('Contact form submitted:', { name, email, message });
        this.render('site/contact', {
            title: 'Contact',
            message: 'Thank you for contacting us! We will get back to you soon.',
            currentUser: this.request.user,
            isContact: true,
            showFab: false
        });
    }
}
exports.SiteController = SiteController;
//# sourceMappingURL=SiteController.js.map
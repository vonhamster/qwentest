import { Request, Response } from 'express';
import { Controller, RouteConfig } from '../core/Controller';
import { Post } from '../models/Post';
import { AuthRequest } from '../middlewares/AuthMiddleware';

export class SiteController extends Controller {
  getRoutes(): RouteConfig[] {
    return [
      { method: 'GET', path: '/', action: 'index' },
      { method: 'GET', path: '/about', action: 'about' },
      { method: 'GET', path: '/contact', action: 'contact' },
      { method: 'POST', path: '/contact', action: 'contactSubmit' },
    ];
  }

  async index(): Promise<void> {
    const posts = Post.findPublished();
    this.render('site/index', { 
      title: 'Home',
      posts: posts.map(p => p.toJSON()),
      currentUser: (this.request as AuthRequest).user
    });
  }

  async about(): Promise<void> {
    this.render('site/about', { 
      title: 'About Us',
      currentUser: (this.request as AuthRequest).user
    });
  }

  async contact(): Promise<void> {
    this.render('site/contact', { 
      title: 'Contact',
      message: '',
      currentUser: (this.request as AuthRequest).user
    });
  }

  async contactSubmit(): Promise<void> {
    const { name, email, message } = this.request.body;
    
    // Here you would typically save the message or send an email
    console.log('Contact form submitted:', { name, email, message });
    
    this.render('site/contact', { 
      title: 'Contact',
      message: 'Thank you for contacting us! We will get back to you soon.',
      currentUser: (this.request as AuthRequest).user
    });
  }
}

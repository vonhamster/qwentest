import * as fs from 'fs';
import * as path from 'path';

export class ViewEngine {
  private viewsPath: string;
  private layoutsPath: string;
  private layout: string | null = 'main';
  private sharedData: Record<string, any> = {};

  constructor(viewsPath: string, layoutsPath: string) {
    this.viewsPath = viewsPath;
    this.layoutsPath = layoutsPath;
  }

  setLayout(layout: string | null): void {
    this.layout = layout;
  }

  assign(key: string, value: any): void {
    this.sharedData[key] = value;
  }

  render(view: string, data: Record<string, any> = {}): string {
    // Merge shared data with view-specific data
    const mergedData = { ...this.sharedData, ...data };
    
    // Convert view path to file path (e.g., 'site/index' -> 'views/site/index.html')
    const viewPath = path.join(this.viewsPath, `${view}.html`);
    
    if (!fs.existsSync(viewPath)) {
      throw new Error(`View not found: ${viewPath}`);
    }

    let content = fs.readFileSync(viewPath, 'utf-8');
    content = this.parseTemplate(content, mergedData);

    // Apply layout if specified
    if (this.layout) {
      const layoutPath = path.join(this.layoutsPath, `${this.layout}.html`);
      
      if (fs.existsSync(layoutPath)) {
        let layoutContent = fs.readFileSync(layoutPath, 'utf-8');
        layoutContent = this.parseTemplate(layoutContent, { 
          ...mergedData, 
          content 
        });
        return layoutContent;
      }
    }

    return content;
  }

  private parseTemplate(template: string, data: Record<string, any>): string {
    // Simple template engine - replace {{ variable }} with actual values
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variable) => {
      const keys = variable.trim().split('.');
      let value: any = data;
      
      for (const key of keys) {
        if (value !== undefined && value !== null) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      
      return value !== undefined ? String(value) : '';
    });
  }

  renderPartial(partial: string, data: Record<string, any> = {}): string {
    const partialPath = path.join(this.viewsPath, `${partial}.html`);
    
    if (!fs.existsSync(partialPath)) {
      throw new Error(`Partial not found: ${partialPath}`);
    }

    const content = fs.readFileSync(partialPath, 'utf-8');
    return this.parseTemplate(content, { ...this.sharedData, ...data });
  }
}

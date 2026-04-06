"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ViewEngine {
    constructor(viewsPath, layoutsPath) {
        this.layout = 'main';
        this.sharedData = {};
        this.viewsPath = viewsPath;
        this.layoutsPath = layoutsPath;
    }
    setLayout(layout) {
        this.layout = layout;
    }
    assign(key, value) {
        this.sharedData[key] = value;
    }
    render(view, data = {}) {
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
    parseTemplate(template, data) {
        let result = template;
        // Process inverted sections {{^variable}}...{{/variable}} (shows content if variable is falsy)
        const invertedSectionRegex = /\{\{\s*\^([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/\1\s*\}\}/g;
        result = result.replace(invertedSectionRegex, (match, variable, content) => {
            const keys = variable.trim().split('.');
            let value = data;
            for (const key of keys) {
                if (value !== undefined && value !== null) {
                    value = value[key];
                }
                else {
                    value = undefined;
                    break;
                }
            }
            // If value is falsy (undefined, null, false, 0, empty string), show content
            if (!value) {
                return this.parseTemplate(content, data);
            }
            return '';
        });
        // Process sections {{#variable}}...{{/variable}} (shows content if variable is truthy)
        const sectionRegex = /\{\{\s*#([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/\1\s*\}\}/g;
        result = result.replace(sectionRegex, (match, variable, content) => {
            const keys = variable.trim().split('.');
            let value = data;
            for (const key of keys) {
                if (value !== undefined && value !== null) {
                    value = value[key];
                }
                else {
                    value = undefined;
                    break;
                }
            }
            // If value is truthy, show content
            if (value) {
                return this.parseTemplate(content, data);
            }
            return '';
        });
        // Simple template engine - replace {{ variable }} with actual values
        result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variable) => {
            // Skip if this looks like a section marker (already processed)
            if (variable.startsWith('#') || variable.startsWith('^') || variable.startsWith('/')) {
                return match;
            }
            const keys = variable.trim().split('.');
            let value = data;
            for (const key of keys) {
                if (value !== undefined && value !== null) {
                    value = value[key];
                }
                else {
                    value = undefined;
                    break;
                }
            }
            return value !== undefined ? String(value) : '';
        });
        return result;
    }
    renderPartial(partial, data = {}) {
        const partialPath = path.join(this.viewsPath, `${partial}.html`);
        if (!fs.existsSync(partialPath)) {
            throw new Error(`Partial not found: ${partialPath}`);
        }
        const content = fs.readFileSync(partialPath, 'utf-8');
        return this.parseTemplate(content, { ...this.sharedData, ...data });
    }
}
exports.ViewEngine = ViewEngine;
//# sourceMappingURL=ViewEngine.js.map
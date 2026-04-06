"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
class Controller {
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }
    render(view, data = {}) {
        const viewEngine = this.constructor.getViewEngine();
        const html = viewEngine.render(view, data);
        this.response.send(html);
    }
    json(data) {
        this.response.json(data);
    }
    redirect(url) {
        this.response.redirect(url);
    }
    static getViewEngine() {
        // This will be overridden by the application
        return null;
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map
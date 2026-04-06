export declare class ViewEngine {
    private viewsPath;
    private layoutsPath;
    private layout;
    private sharedData;
    constructor(viewsPath: string, layoutsPath: string);
    setLayout(layout: string | null): void;
    assign(key: string, value: any): void;
    render(view: string, data?: Record<string, any>): string;
    private parseTemplate;
    renderPartial(partial: string, data?: Record<string, any>): string;
}
//# sourceMappingURL=ViewEngine.d.ts.map
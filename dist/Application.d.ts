export declare class ApplicationClass {
    private app;
    private viewEngine;
    private router;
    private port;
    constructor(port?: number);
    initialize(): void;
    start(): void;
    stop(): void;
}
export declare function createApp(port?: number): ApplicationClass;
export declare function getApp(): ApplicationClass;
export declare const Application: typeof ApplicationClass;
//# sourceMappingURL=Application.d.ts.map
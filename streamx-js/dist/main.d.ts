declare class StreamX {
    private baseUrl;
    private channel;
    private eventSource;
    constructor(baseUrl?: string, channel?: string);
    private conect;
    on(event: string, callback: (data: any) => void): void;
    destroy(): void;
}

export { StreamX as default };

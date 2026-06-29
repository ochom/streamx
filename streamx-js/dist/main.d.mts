type Config = {
    apiUrl?: string;
    topic?: string;
};
declare abstract class StreamX {
    private baseUrl;
    private channel?;
    private eventSource;
    constructor(cfg?: Config);
    private conect;
    on(event: string, callback: (data: any) => void): void;
    listen(channel: string): void;
    destroy(): void;
}

export { StreamX };

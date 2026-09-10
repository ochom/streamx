type Config = {
    apiUrl?: string;
    topic: string;
};
declare class StreamX extends EventSource {
    private baseUrl?;
    constructor(cfg: Config);
    isOpen(): boolean;
    on(event: string, callback: (data: any) => void): void;
    listen(newChannel: string): StreamX;
    destroy(): void;
}

export { StreamX };

type callBackFunc = (event: any) => void;
type Config = {
    apiKey: string;
    instanceID: string;
    channel?: string;
    baseUrl?: string;
    pollInterval?: number;
};
type Event = {
    key: string;
    fn: callBackFunc;
};
declare class StreamX {
    private config;
    private interval;
    private events;
    private eventSource?;
    constructor(config: Config);
    private validate;
    private poll;
    listen(channel?: string): Promise<void>;
    on(eventName: string, callback: callBackFunc): void;
    destroy(): void;
}

export { type Config, type Event, type callBackFunc, StreamX as default };

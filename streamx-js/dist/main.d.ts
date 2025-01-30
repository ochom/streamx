type callBackFunc = (event: any) => void;
declare class StreamX {
    es: EventSource;
    constructor(apiKey: string, instanceID: string, channelID: string, config?: any);
    on(eventName: string, callback: callBackFunc): void;
    close(): void;
}

export { type callBackFunc, StreamX as default };

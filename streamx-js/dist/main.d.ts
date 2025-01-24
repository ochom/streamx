type callBackFunc = (event: EventData) => void;
type EventData = {
    id: string;
    event: string;
    data: string;
};
declare class StreamX {
    es: EventSource;
    constructor(apiKey: string, instanceID: string, channelID: string);
    on(eventName: string, callback: callBackFunc): void;
    close(): void;
}

export { type EventData, type callBackFunc, StreamX as default };

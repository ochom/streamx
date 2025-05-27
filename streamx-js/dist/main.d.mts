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
/**
 * StreamX class for managing real-time event streams.
 * It allows subscribing to a channel and listening for events.
 * It supports automatic reconnection and event handling.
 * The class can be configured with an API key, instance ID, channel name, base URL, and polling interval.
 * It also provides methods to listen for events, register event handlers, and destroy the stream.
 * @param config - Configuration object containing apiKey, instanceID, channel, baseUrl, and pollInterval.
 * @property {string} apiKey - The API key for authentication.
 * @property {string} instanceID - The unique identifier for the instance.
 * @property {string} [channel] - The channel to listen to. Defaults to "ABC".
 * @property {string} [baseUrl] - The base URL for the StreamX API. Defaults to "https://api.streamx.co.ke".
 * @property {number} [pollInterval] - The interval in seconds to poll for updates. Defaults to 30 minutes (1800 seconds).
 *
 *
 * @example
 * const stream = new StreamX({
 *   apiKey: "your_api_key",
 *  instanceID: "your_instance_id",
 *  channel: "your_channel_name",
 *  baseUrl: "https://api.streamx.co.ke",
 * pollInterval: 30 * 60 // 30 minutes
 * });
 *
 * stream.on("message", (data) => {
 *   console.log("Received message:", data);
 * });
 *
 * stream.listen(); // Start listening for events
 */
declare class StreamX {
    private config;
    private interval;
    private events;
    private eventSource?;
    private prevEventSource?;
    constructor(config: Config);
    /**
     * Validates the configuration to ensure required fields are present.
     * Throws an error if any required field is missing.
     */
    private validate;
    /**
     * Starts polling for updates at the specified interval.
     * If pollInterval is not set, defaults to 30 minutes.
     */
    private poll;
    /**
     * Listens for events on the specified channel.
     * If a channel is provided, it updates the current channel.
     * It creates a new EventSource instance and adds event listeners for all registered events.
     * It also closes the previous EventSource instance after 2 seconds.
     * @param channel - Optional channel name to listen to.
     */
    listen(channel?: string): Promise<void>;
    /**
     * Registers an event listener for a specific event.
     * If no event name is provided, defaults to "message".
     * @param eventName - The name of the event to listen for.
     * @param callback - The callback function to execute when the event occurs.
     * @example
     * stream.on("message", (data) => {
     *   console.log("Received message:", data);
     * });
     */
    on(eventName: string, callback: callBackFunc): void;
    /**
     * Destroys the current EventSource instance and clears the interval.
     * This method should be called when the stream is no longer needed to free up resources.
     */
    destroy(): void;
}

export { type Config, type Event, type callBackFunc, StreamX as default };

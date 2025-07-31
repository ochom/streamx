export type callBackFunc = (event: any) => void;

export type Config = {
  channel?: string;
  baseUrl?: string;
  pollInterval?: number;
};

export type Event = {
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
export default class StreamX {
  private config: Config = {
    channel: "ABC",
    baseUrl: "https://api.streamx.co.ke",
    pollInterval: 30 * 60, // 30 minutes
  };

  private interval: any = undefined;
  private events: Event[] = [];
  private eventSource?: EventSource = undefined;
  private prevEventSource?: EventSource = undefined;

  constructor(config: Config) {
    this.config = { ...this.config, ...config };
    this.poll();
  }

  /**
   * Starts polling for updates at the specified interval.
   * If pollInterval is not set, defaults to 30 minutes.
   */
  private async poll() {
    if (
      this.config.pollInterval === undefined ||
      this.config.pollInterval === 0
    ) {
      this.config.pollInterval = 30 * 60;
    }

    this.interval = setInterval(
      () => this.listen(),
      this.config.pollInterval * 1000
    );
  }

  /**
   * Listens for events on the specified channel.
   * If a channel is provided, it updates the current channel.
   * It creates a new EventSource instance and adds event listeners for all registered events.
   * It also closes the previous EventSource instance after 2 seconds.
   * @param channel - Optional channel name to listen to.
   */
  async listen(channel?: string) {
    console.log("Creating new stream 🚀");
    if (channel) {
      this.config.channel = channel;
    }

    // Store the old stream before replacing it
    if (this.eventSource) {
      this.prevEventSource = this.eventSource;
    }

    // Create a new instance of EventSource
    const url = `${this.config.baseUrl}/subscribe/${this.config.channel}`;
    this.eventSource = new EventSource(url);

    // Add all existing event listeners to the new stream
    for (const event of this.events) {
      this.eventSource.addEventListener(event.key, (msg: MessageEvent) =>
        event.fn(msg?.data || "{}")
      );
    }

    console.log("New stream created 👌");

    // Close previous instance after 2 seconds
    if (this.prevEventSource) {
      setTimeout(() => {
        console.log("Closing previous stream 👋");
        this.prevEventSource?.close();
        this.prevEventSource = undefined;
      }, 2000);
    }
  }

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
  on(eventName: string, callback: callBackFunc) {
    if (!eventName) {
      eventName = "message";
    }

    this.events.push({ key: eventName, fn: callback });
  }

  /**
   * Destroys the current EventSource instance and clears the interval.
   * This method should be called when the stream is no longer needed to free up resources.
   */
  destroy() {
    if (!this.eventSource) {
      return;
    }

    clearInterval(this.interval);
    this.eventSource.close();
    this.eventSource = undefined;
    this.prevEventSource = undefined;
  }
}

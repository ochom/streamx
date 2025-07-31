// src/main.ts
var StreamX = class {
  constructor(config) {
    this.config = {
      channel: "ABC",
      baseUrl: "https://api.streamx.co.ke",
      pollInterval: 30 * 60
      // 30 minutes
    };
    this.interval = void 0;
    this.events = [];
    this.eventSource = void 0;
    this.prevEventSource = void 0;
    this.config = { ...this.config, ...config };
    this.poll();
  }
  /**
   * Starts polling for updates at the specified interval.
   * If pollInterval is not set, defaults to 30 minutes.
   */
  async poll() {
    if (this.config.pollInterval === void 0 || this.config.pollInterval === 0) {
      this.config.pollInterval = 30 * 60;
    }
    this.interval = setInterval(
      () => this.listen(),
      this.config.pollInterval * 1e3
    );
  }
  /**
   * Listens for events on the specified channel.
   * If a channel is provided, it updates the current channel.
   * It creates a new EventSource instance and adds event listeners for all registered events.
   * It also closes the previous EventSource instance after 2 seconds.
   * @param channel - Optional channel name to listen to.
   */
  async listen(channel) {
    console.log("Creating new stream \u{1F680}");
    if (channel) {
      this.config.channel = channel;
    }
    if (this.eventSource) {
      this.prevEventSource = this.eventSource;
    }
    const url = `${this.config.baseUrl}/subscribe/${this.config.channel}`;
    this.eventSource = new EventSource(url);
    for (const event of this.events) {
      this.eventSource.addEventListener(
        event.key,
        (msg) => event.fn(msg?.data || "{}")
      );
    }
    console.log("New stream created \u{1F44C}");
    if (this.prevEventSource) {
      setTimeout(() => {
        console.log("Closing previous stream \u{1F44B}");
        this.prevEventSource?.close();
        this.prevEventSource = void 0;
      }, 2e3);
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
  on(eventName, callback) {
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
    this.eventSource = void 0;
    this.prevEventSource = void 0;
  }
};
export {
  StreamX as default
};

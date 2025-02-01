// src/main.ts
var StreamX = class {
  constructor(config) {
    this.config = {
      apiKey: "",
      instanceID: "",
      channel: "ABC",
      baseUrl: "https://api.streamx.co.ke",
      pollInterval: 30 * 60
      // 30 minutes
    };
    this.interval = void 0;
    this.events = [];
    this.eventSource = void 0;
    this.config = { ...this.config, ...config };
    this.validate();
    this.poll();
  }
  validate() {
    if (!this.config.apiKey) {
      throw new Error("apiKey is required");
    }
    if (!this.config.instanceID) {
      throw new Error("instanceID is required");
    }
  }
  async poll() {
    if (this.config.pollInterval === void 0 || this.config.pollInterval === 0) {
      this.config.pollInterval = 30 * 60;
    }
    this.interval = setInterval(() => {
      console.log("creating a new event source");
      this.listen();
      console.log("listening to events");
    }, this.config.pollInterval * 1e3);
  }
  async listen(channel) {
    if (channel) {
      this.config.channel = channel;
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
    const url = `${this.config.baseUrl}/subscribe/${this.config.apiKey}/${this.config.instanceID}/${this.config.channel}`;
    this.eventSource = new EventSource(url);
    for (const event of this.events) {
      this.eventSource.addEventListener(
        event.key,
        (msg) => event.fn(msg?.data || "{}")
      );
    }
  }
  on(eventName, callback) {
    if (!eventName) {
      eventName = "message";
    }
    this.events.push({ key: eventName, fn: callback });
  }
  destroy() {
    if (!this.eventSource) {
      return;
    }
    clearInterval(this.interval);
    this.eventSource.close();
  }
};
export {
  StreamX as default
};

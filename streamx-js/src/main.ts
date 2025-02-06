export type callBackFunc = (event: any) => void;

export type Config = {
  apiKey: string;
  instanceID: string;
  channel?: string;
  baseUrl?: string;
  pollInterval?: number;
};

export type Event = {
  key: string;
  fn: callBackFunc;
};

export default class StreamX {
  private config: Config = {
    apiKey: "",
    instanceID: "",
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
    this.validate();
    this.poll();
  }

  private validate() {
    if (!this.config.apiKey) {
      throw new Error("apiKey is required");
    }

    if (!this.config.instanceID) {
      throw new Error("instanceID is required");
    }
  }

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
    const url = `${this.config.baseUrl}/subscribe/${this.config.apiKey}/${this.config.instanceID}/${this.config.channel}`;
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

  on(eventName: string, callback: callBackFunc) {
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
    this.eventSource = undefined;
    this.prevEventSource = undefined;
  }
}

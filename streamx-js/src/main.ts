type Config = {
  apiUrl?: string;
  topic?: string;
};

export abstract class StreamX {
  private baseUrl: string = "https://api.streamx.co.ke";
  private channel?: string;
  private eventSource: EventSource | undefined;

  constructor(cfg?: Config) {
    if (!cfg) return;

    if (cfg.topic) {
      this.channel = cfg.topic;
    }

    if (cfg.apiUrl) {
      this.baseUrl = cfg.apiUrl;
    }

    if (this.channel) {
      this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
    }
  }

  private conect(url: string) {
    this.eventSource = new EventSource(url);
    this.eventSource.onopen = () => {
      console.log(`streamx listening to topic: ${this.channel}`);
    };
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.eventSource) {
      console.error("EventSource is not initialized");
      return;
    }
    this.eventSource.addEventListener(event, (e) => {
      try {
        const data = JSON.parse(e.data);
        callback(data);
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: e.data });
      }
    });
  }

  public listen(channel: string) {
    this.channel = channel;
    this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
  }

  public destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log(`streamx connection closed`);
    }
  }
}

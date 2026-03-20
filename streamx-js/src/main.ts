export class StreamX {
  private baseUrl: string;
  private channel: string;
  private eventSource: EventSource | undefined;
  constructor(baseUrl?: string, channel?: string) {
    this.baseUrl = baseUrl || "https://api.streamx.co.ke";
    this.channel = channel || "default";
    this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
  }

  private conect(url: string) {
    this.eventSource = new EventSource(url);
    this.eventSource.onopen = () => {
      console.log("Connected to streamX");
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

  public destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log("StreamX connection closed");
    }
  }
}

type Config = {
  apiUrl?: string; // Made optional to prevent empty crashes
  topic: string;
};

export class StreamX extends EventSource {
  private baseUrl?: string;

  constructor(cfg: Config) {
    const base = cfg.apiUrl || "https://api.streamx.co.ke";

    super(`${base}/subscribe/${cfg.topic}`);
    this.baseUrl = base;

    console.log(`streamx listening for topic: ${cfg.topic}`);
  }

  public isOpen(): boolean {
    return this.readyState === EventSource.OPEN;
  }

  public on(event: string, callback: (data: any) => void) {
    this.addEventListener(event, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        callback(data);
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: e.data });
      }
    });
  }

  public listen(newChannel: string): StreamX {
    this.close();
    return new StreamX({ apiUrl: this.baseUrl, topic: newChannel });
  }

  public destroy() {
    this.close();
    console.log(`streamx connection closed`);
  }
}

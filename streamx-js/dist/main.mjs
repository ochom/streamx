// src/main.ts
var StreamX = class {
  constructor(cfg) {
    this.baseUrl = "https://api.streamx.co.ke";
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
  conect(url) {
    this.eventSource = new EventSource(url);
    this.eventSource.onopen = () => {
      console.log(`streamx listening to topic: ${this.channel}`);
    };
  }
  on(event, callback) {
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
  listen(channel) {
    this.channel = channel;
    this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
  }
  destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log(`streamx connection closed`);
    }
  }
};
export {
  StreamX
};

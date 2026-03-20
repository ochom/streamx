// src/main.ts
var StreamX = class {
  constructor(baseUrl, channel) {
    this.baseUrl = baseUrl || "https://api.streamx.co.ke";
    this.channel = channel || "default";
    this.conect(`${this.baseUrl}/subscribe/${this.channel}`);
  }
  conect(url) {
    this.eventSource = new EventSource(url);
    this.eventSource.onopen = () => {
      console.log("Connected to streamX");
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
  destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      console.log("StreamX connection closed");
    }
  }
};
var main_default = StreamX;
export {
  main_default as default
};

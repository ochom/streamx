// src/main.ts
var StreamX = class _StreamX extends EventSource {
  constructor(cfg) {
    const base = cfg.apiUrl || "https://api.streamx.co.ke";
    super(`${base}/subscribe/${cfg.topic}`);
    this.baseUrl = base;
    console.log(`streamx listening for topic: ${cfg.topic}`);
  }
  isOpen() {
    return this.readyState === EventSource.OPEN;
  }
  on(event, callback) {
    this.addEventListener(event, (e) => {
      try {
        const data = JSON.parse(e.data);
        callback(data);
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: e.data });
      }
    });
  }
  listen(newChannel) {
    this.close();
    return new _StreamX({ apiUrl: this.baseUrl, topic: newChannel });
  }
  destroy() {
    this.close();
    console.log(`streamx connection closed`);
  }
};
export {
  StreamX
};

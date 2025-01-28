// src/main.ts
var StreamX = class {
  constructor(apiKey, instanceID, channelID, config) {
    const baseUrl = config?.baseUrl || "https://api.streamx.co.ke";
    this.es = new EventSource(
      `${baseUrl}/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }
  on(eventName, callback) {
    if (!eventName) {
      eventName = "message";
    }
    this.es.addEventListener(eventName, (event) => {
      callback(event?.data || "{}");
    });
  }
  close() {
    this.es.close();
  }
};
export {
  StreamX as default
};

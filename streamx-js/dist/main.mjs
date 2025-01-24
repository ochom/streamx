// src/main.ts
var StreamX = class {
  constructor(apiKey, instanceID, channelID) {
    this.es = new EventSource(
      `https://apis.streamx.io/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }
  on(eventName, callback) {
    if (!eventName) {
      eventName = "message";
    }
    this.es.addEventListener(eventName, (event) => {
      const data = {
        id: event.lastEventId,
        event: event.type,
        data: event.data
      };
      callback(data);
    });
  }
  close() {
    this.es.close();
  }
};
export {
  StreamX as default
};

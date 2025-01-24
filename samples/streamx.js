export default class StreamX {
  static es = null;
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
      callback(event);
    });
  }

  close() {
    this.es.close();
  }
}

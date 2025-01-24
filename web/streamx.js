export default class StreamX {
  static es = null;
  constructor(apiKey, instanceID, channelID) {
    this.es = new EventSource(
      `http://localhost:8080/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }

  on(eventName, callback) {
    if (!eventName) {
      eventName = "message";
    }

    this.es.addEventListener(eventName, (event) => {
      callback(JSON.parse(event.data));
    });
  }

  close() {
    this.es.close();
  }
}

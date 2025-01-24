export type callBackFunc = (event: EventData) => void;
export type EventData = {
  id: string;
  event: string;
  data: string;
};

export default class StreamX {
  es: EventSource;
  constructor(
    apiKey: string,
    instanceID: string,
    channelID: string,
    config?: any
  ) {
    const baseUrl = config?.baseUrl || "https://apis.streamx.io";
    this.es = new EventSource(
      `${baseUrl}/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }

  on(eventName: string, callback: callBackFunc) {
    if (!eventName) {
      eventName = "message";
    }

    this.es.addEventListener(eventName, (event: MessageEvent) => {
      const data: EventData = {
        id: event.lastEventId,
        event: event.type,
        data: event.data,
      };

      callback(data);
    });
  }

  close() {
    this.es.close();
  }
}

export type callBackFunc = (event: any) => void;

export default class StreamX {
  es: EventSource;
  constructor(
    apiKey: string,
    instanceID: string,
    channelID: string,
    config?: any
  ) {
    const baseUrl = config?.baseUrl || "https://api.streamx.co.ke";
    this.es = new EventSource(
      `${baseUrl}/subscribe/${apiKey}/${instanceID}/${channelID}`
    );
  }

  on(eventName: string, callback: callBackFunc) {
    if (!eventName) {
      eventName = "message";
    }

    this.es.addEventListener(eventName, (event: MessageEvent) => {
      callback(event?.data || "{}");
    });
  }

  close() {
    this.es.close();
  }
}

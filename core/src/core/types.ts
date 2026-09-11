export type Message = {
  id?: string;
  topic: string;
  message: SseEvent;
};

export type SseEvent = {
  event: string;
  data: any;
};

export type Message = {
  id?: string;
  topic: string;
  message?: any; // Deprecated, use data instead
} & SseEvent;

export type SseEvent = {
  event: string;
  data: any;
};

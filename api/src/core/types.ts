export type Message = {
  id?: string;
  channel?: string;
  event: string;
  data: any;
  message?: any; // Deprecated, use data instead
};

type Config = {
  apiUrl?: string;
  topic: string;
};

type BatchOptions = {
  interval?: number;
  maxBatchSize?: number;
};

export class StreamX extends EventSource {
  private baseUrl: string;

  private batchTimers = new Set<ReturnType<typeof setInterval>>();
  private batchBuffers = new Set<() => void>();

  constructor(cfg: Config) {
    const base = (cfg.apiUrl || "https://api.streamx.co.ke").replace(
      /\/+$/,
      "",
    );

    super(`${base}/subscribe/${encodeURIComponent(cfg.topic)}`);

    this.baseUrl = base;

    console.log(`streamx listening for topic: ${cfg.topic}`);
  }

  public isOpen(): boolean {
    return this.readyState === EventSource.OPEN;
  }

  public on(event: string, callback: (data: any) => void): void {
    this.addEventListener(event, (message) => {
      try {
        callback(JSON.parse(message.data));
      } catch (error) {
        console.debug("Error parsing event data:", error);
        callback({ data: message.data });
      }
    });
  }

  public onBatch(
    event: string,
    callback: (data: any[]) => void | Promise<void>,
    options: BatchOptions = {},
  ): void {
    const interval = Math.max(options.interval ?? 100, 50);
    const maxBatchSize = Math.max(options.maxBatchSize ?? 500, 1);

    let batch: any[] = [];
    let processing = false;
    let disposed = false;

    const flush = async () => {
      if (processing || batch.length === 0 || disposed) {
        return;
      }

      processing = true;

      // Detach the current batch so incoming events
      // can be collected while this batch is processed.
      const currentBatch = batch;
      batch = [];

      try {
        await callback(currentBatch);
      } catch (error) {
        console.error("StreamX batch processing error:", error);
      } finally {
        processing = false;

        // Process any events accumulated during the callback.
        if (batch.length >= maxBatchSize) {
          void flush();
        }
      }
    };

    const listener = (e: Event) => {
      if (disposed) return;

      const message = e as MessageEvent;

      try {
        batch.push(JSON.parse(message.data));
      } catch (error) {
        console.debug("Error parsing event data:", error);
        batch.push({ data: message.data });
      }

      if (batch.length >= maxBatchSize) {
        void flush();
      }
    };

    this.addEventListener(event, listener);

    const timer = setInterval(() => {
      void flush();
    }, interval);

    this.batchTimers.add(timer);

    this.batchBuffers.add(() => {
      disposed = true;
      this.removeEventListener(event, listener);
      clearInterval(timer);
      this.batchTimers.delete(timer);
    });
  }

  public override close(): void {
    for (const dispose of this.batchBuffers) {
      dispose();
    }

    this.batchBuffers.clear();

    for (const timer of this.batchTimers) {
      clearInterval(timer);
    }

    this.batchTimers.clear();

    super.close();
  }

  public listen(newChannel: string): StreamX {
    this.close();

    return new StreamX({
      apiUrl: this.baseUrl,
      topic: newChannel,
    });
  }

  public destroy(): void {
    this.close();
    console.log("StreamX connection closed");
  }
}

import { useEffect, useMemo, useRef, useState } from "react";
import { StreamX } from "streamx-js";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Login from "./login";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type Acitvity = {
  timestamp: string;
  clients: number;
};

type MessageActivity = {
  timestamp: string;
  messages: number;
};

type AnalyticsSummary = {
  peak_clients_6h: number;
  avg_clients_6h: number;
  messages_last_hour: number;
  messages_last_24h: number;
  peak_messages_per_minute_6h: number;
  total_messages_6h: number;
};

type AppState = {
  active_clients: number;
  activity: Acitvity[];
  message_activity: MessageActivity[];
  summary: AnalyticsSummary;
  received_at: string;
};

const emptySummary: AnalyticsSummary = {
  peak_clients_6h: 0,
  avg_clients_6h: 0,
  messages_last_hour: 0,
  messages_last_24h: 0,
  peak_messages_per_minute_6h: 0,
  total_messages_6h: 0,
};

const defaultAppState: AppState = {
  active_clients: 0,
  activity: [],
  message_activity: [],
  summary: emptySummary,
  received_at: "",
};

const AUTH_STORAGE_KEY = "streamx.dashboard.authenticated";

const formatLabel = (timestamp: string) => {
  const parts = timestamp.split(" ");
  return parts[1] ?? timestamp;
};

function CodeSnippet({
  filename,
  language,
  code,
}: {
  filename: string;
  language: string;
  code: string;
}) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="snippet-shell" role="presentation">
      <div className="snippet-head">
        <div className="snippet-controls" aria-hidden="true">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="snippet-meta">
          <span className="snippet-file">{filename}</span>
          <span className="snippet-lang">{language}</span>
        </div>
      </div>
      <pre className="code-block">
        <code>
          {lines.map((line, index) => (
            <span className="code-line" key={`${filename}-${index}`}>
              <span className="line-number">{index + 1}</span>
              <span className="line-text">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connected"
  >("disconnected");
  const [lastHeartbeat, setLastHeartbeat] = useState<string>("");
  const [appState, setAppState] = useState<AppState>(defaultAppState);
  const streamRef = useRef<StreamX | null>(null);

  const disconnect = () => {
    streamRef.current?.destroy();
    streamRef.current = null;
    setConnectionState("disconnected");
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (authenticated && !streamRef.current) {
      fetchAppState();
    }

    if (!authenticated) {
      disconnect();
    }
  }, [authenticated]);

  const fetchAppState = async () => {
    try {
      disconnect();
      const stream = new StreamX(window.location.origin, "stats");
      streamRef.current = stream;

      stream.on("welcome", () => {
        setConnectionState("connected");
      });

      stream.on("keep-alive", (payload: { timestamp?: string }) => {
        setLastHeartbeat(payload.timestamp ?? new Date().toISOString());
      });

      stream.on("message", (data: AppState) => {
        const normalizedActivity = (data.activity ?? []).map((entry) => ({
          timestamp: entry.timestamp,
          clients: entry.clients,
        }));
        const normalizedMessageActivity = (data.message_activity ?? []).map(
          (entry) => ({
            timestamp: entry.timestamp,
            messages: entry.messages,
          }),
        );

        setConnectionState("connected");
        setLastHeartbeat(new Date().toISOString());
        setAppState({
          active_clients: data.active_clients ?? 0,
          activity: normalizedActivity,
          message_activity: normalizedMessageActivity,
          summary: data.summary ?? emptySummary,
          received_at: data.received_at ?? "",
        });
      });
    } catch (error) {
      console.error(error);
      setConnectionState("disconnected");
    }
  };

  const authenticate = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    const resp = await fetch("/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (resp.ok) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setAuthenticated(true);
    } else {
      setAuthError("Authentication failed. Verify credentials and try again.");
    }

    setAuthLoading(false);
  };

  const timelineLabels = useMemo(
    () => appState.activity.map((entry) => formatLabel(entry.timestamp)),
    [appState.activity],
  );

  const messageByTimestamp = useMemo(() => {
    return new Map(
      appState.message_activity.map((entry) => [
        entry.timestamp,
        entry.messages,
      ]),
    );
  }, [appState.message_activity]);

  const messageSeriesForClients = useMemo(
    () =>
      appState.activity.map(
        (entry) => messageByTimestamp.get(entry.timestamp) ?? null,
      ),
    [appState.activity, messageByTimestamp],
  );

  const heartbeatAgeSeconds = useMemo(() => {
    if (!lastHeartbeat) {
      return null;
    }
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(lastHeartbeat).getTime()) / 1000),
    );
  }, [lastHeartbeat]);

  if (!authenticated) {
    return (
      <main className="site-shell">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <header className="landing-topbar">
          <div className="brand-block">
            <span className="brand-pill">STREAMX</span>
            <span className="brand-copy">SSE Pub/Sub + Analytics Console</span>
          </div>
          <div className="topbar-chips">
            <span>Realtime Fanout</span>
            <span>Secure Publish</span>
            <span>Built-in Metrics</span>
          </div>
        </header>

        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Self-hosted Event Streaming Layer</p>
            <h1 className="hero-title">
              Deliver Events Instantly. Observe Everything.
            </h1>
            <p className="hero-subtitle">
              StreamX is an SSE server for channel-based pub/sub with durable
              operational visibility. Publish events over HTTP, subscribe with
              native EventSource, and monitor subscriber load plus message
              throughput from one dashboard.
            </p>

            <div className="feature-grid">
              <article className="feature-card">
                <h3>/publish</h3>
                <p>
                  Push messages into any channel with event name and payload.
                  Harden with Basic Auth and IP filtering.
                </p>
              </article>
              <article className="feature-card">
                <h3>/subscribe/:channelID</h3>
                <p>
                  Create low-latency subscribers through SSE with keep-alives
                  and backpressure-aware connection handling.
                </p>
              </article>
              <article className="feature-card">
                <h3>stats channel</h3>
                <p>
                  Receive live analytics snapshots every 5 seconds, including
                  active clients and message-per-minute trends.
                </p>
              </article>
            </div>
          </div>

          <aside className="hero-login">
            <Login
              authenticate={authenticate}
              loading={authLoading}
              error={authError}
            />
          </aside>
        </section>

        <section className="landing-panels">
          <article className="panel-card">
            <h2>Architecture Flow</h2>
            <ol className="flow-list">
              <li>Producers POST event payloads to /publish.</li>
              <li>Server fans out messages to matching channel subscribers.</li>
              <li>Heartbeat events keep idle connections healthy.</li>
              <li>Client and message metrics are persisted in SQLite.</li>
              <li>
                Dashboard subscribes to stats for live operations insight.
              </li>
            </ol>
          </article>

          <article className="panel-card" id="quickstart">
            <h2>Quickstart</h2>
            <CodeSnippet
              filename="quickstart.ts"
              language="TypeScript"
              code={`import { StreamX } from "streamx-js";

const stream = new StreamX("orders", "https://your-streamx-host");
stream.on("order.created", (event) => {
  console.log("new order", event);
});`}
            />
            <CodeSnippet
              filename="publish.sh"
              language="Shell"
              code={`curl -X POST https://your-streamx-host/publish \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "orders",
    "event": "order.created",
    "data": { "orderId": "ord_1024", "total": 185.5 }
  }'`}
            />
          </article>

          <article className="panel-card" id="api-map">
            <h2>API Surface</h2>
            <div className="endpoint-grid">
              <div>
                <p className="endpoint-method post">POST</p>
                <p className="endpoint-path">/publish</p>
                <p className="endpoint-note">Publish an event to a channel.</p>
              </div>
              <div>
                <p className="endpoint-method get">GET</p>
                <p className="endpoint-path">/subscribe/:channelID</p>
                <p className="endpoint-note">Subscribe via SSE.</p>
              </div>
              <div>
                <p className="endpoint-method get">GET</p>
                <p className="endpoint-path">/health</p>
                <p className="endpoint-note">Service liveness check.</p>
              </div>
            </div>
            <h3>Operations Checklist</h3>
            <ul className="checklist">
              <li>Set AUTH_USER and AUTH_PASS for dashboard access.</li>
              <li>Set PUBSUB_AUTH_USER and PUBSUB_AUTH_PASS for publishers.</li>
              <li>Set PUBSUB_ALLOWED_ORIGINS for subscriber CORS control.</li>
              <li>Set PUBSUB_ALLOWED_IPS for publisher allow-listing.</li>
            </ul>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Authenticated Analytics</p>
          <h1 className="dashboard-title">StreamX Operations Dashboard</h1>
          <p className="dashboard-subtitle">
            Live health and throughput metrics for the SSE pub/sub system.
          </p>
        </div>
        <div className="dashboard-actions">
          <span
            className={`connection-pill ${
              connectionState === "connected" ? "ok" : "down"
            }`}
          >
            {connectionState === "connected" ? "LIVE" : "OFFLINE"}
          </span>
          <button
            className="btn-secondary"
            onClick={() => {
              window.localStorage.removeItem(AUTH_STORAGE_KEY);
              disconnect();
              setAuthenticated(false);
              setAuthError(null);
              setAppState(defaultAppState);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Active Subscribers</p>
          <p className="stat-value">{appState.active_clients}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Peak Clients (6h)</p>
          <p className="stat-value">{appState.summary.peak_clients_6h}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Average Clients (6h)</p>
          <p className="stat-value">{appState.summary.avg_clients_6h}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Messages Last Hour</p>
          <p className="stat-value">{appState.summary.messages_last_hour}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Messages Last 24h</p>
          <p className="stat-value">{appState.summary.messages_last_24h}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Peak Msg/Min (6h)</p>
          <p className="stat-value">
            {appState.summary.peak_messages_per_minute_6h}
          </p>
        </article>
      </section>

      <section className="charts-grid">
        <article className="chart-container">
          <h2 className="chart-title">Subscriber and Throughput Trend</h2>
          {appState.activity.length === 0 ? (
            <p className="chart-empty">No activity data yet.</p>
          ) : (
            <div className="chart-wrapper">
              <Line
                data={{
                  labels: timelineLabels,
                  datasets: [
                    {
                      label: "Clients",
                      data: appState.activity.map((entry) => entry.clients),
                      borderColor: "#126782",
                      backgroundColor: "rgba(18, 103, 130, 0.16)",
                      fill: true,
                      tension: 0.35,
                      pointRadius: 0,
                    },
                    {
                      label: "Messages/Min",
                      data: messageSeriesForClients,
                      borderColor: "#e36414",
                      backgroundColor: "rgba(227, 100, 20, 0.1)",
                      fill: false,
                      tension: 0.35,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index",
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#173645",
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxTicksLimit: 10,
                        color: "#4a6572",
                      },
                      grid: {
                        color: "rgba(23, 54, 69, 0.08)",
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: "#4a6572",
                        precision: 0,
                        stepSize: 1,
                      },
                      grid: {
                        color: "rgba(23, 54, 69, 0.08)",
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </article>

        <article className="chart-container">
          <h2 className="chart-title">Message Throughput Timeline</h2>
          {appState.message_activity.length === 0 ? (
            <p className="chart-empty">No message throughput data yet.</p>
          ) : (
            <div className="chart-wrapper">
              <Line
                data={{
                  labels: appState.message_activity.map((entry) =>
                    formatLabel(entry.timestamp),
                  ),
                  datasets: [
                    {
                      label: "Messages/Min",
                      data: appState.message_activity.map(
                        (entry) => entry.messages,
                      ),
                      borderColor: "#de3c4b",
                      backgroundColor: "rgba(222, 60, 75, 0.15)",
                      fill: true,
                      tension: 0.3,
                      pointRadius: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#173645",
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        maxTicksLimit: 8,
                        color: "#4a6572",
                      },
                      grid: {
                        color: "rgba(23, 54, 69, 0.08)",
                      },
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: "#4a6572",
                        precision: 0,
                        stepSize: 1,
                      },
                      grid: {
                        color: "rgba(23, 54, 69, 0.08)",
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </article>
      </section>

      <section className="ops-notes">
        <h3>Stream Health Notes</h3>
        <ul>
          <li>
            Last payload timestamp: {appState.received_at || "waiting..."}
          </li>
          <li>
            Heartbeat age:{" "}
            {heartbeatAgeSeconds === null
              ? "waiting..."
              : `${heartbeatAgeSeconds}s`}
          </li>
          <li>
            Total messages in last 6h: {appState.summary.total_messages_6h}
          </li>
        </ul>
      </section>
    </main>
  );
}

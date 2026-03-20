import moment from "moment";
import { useState } from "react";
import { StreamX } from "streamx-js";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
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
  messages: number;
};

type AppState = {
  active_clients: number;
  active_last_hour: number;
  active_last_6_hours: number;
  active_last_24_hours: number;
  messages_last_hour: number;
  messages_last_24_hours: number;
  activity: Acitvity[];
};

const ACTIVITY_LENGTH = 0; // Keep last 10 minutes of activity (assuming 1 entry per second)
const defaultActivity: Acitvity[] = Array.from(
  { length: ACTIVITY_LENGTH },
  (_, i) => ({
    timestamp: moment()
      .subtract(ACTIVITY_LENGTH - i, "seconds")
      .format("HH:mm:ss"),
    clients: Math.floor(Math.random() * 10),
    messages: Math.floor(Math.random() * 20),
  }),
);

const defaultAppState: AppState = {
  active_clients: 0,
  active_last_hour: 0,
  active_last_6_hours: 0,
  active_last_24_hours: 0,
  messages_last_hour: 0,
  messages_last_24_hours: 0,
  activity: defaultActivity,
};

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  const fetchAppState = async () => {
    try {
      const stream = new StreamX(window.location.origin, "stats");
      stream.on("message", (data: AppState) => {
        setAppState(data);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const authenticate = async (username: string, password: string) => {
    const resp = await fetch("/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (resp.ok) {
      setAuthenticated(true);
      fetchAppState();
    } else {
      alert("Authentication failed");
    }
  };

  if (!authenticated) {
    return <Login authenticate={authenticate} />;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Stream Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Active Clients</p>
          <p className="stat-value blue">{appState.active_clients}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Peak Last Hour</p>
          <p className="stat-value green">{appState.active_last_hour}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Peak Last 6 Hours</p>
          <p className="stat-value purple">{appState.active_last_6_hours}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Peak Last 24 Hours</p>
          <p className="stat-value yellow">{appState.active_last_24_hours}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Messages Last Hour</p>
          <p className="stat-value red">{appState.messages_last_hour}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Messages Last 24 Hours</p>
          <p className="stat-value orange">{appState.messages_last_24_hours}</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="chart-container">
        <h2 className="chart-title">Activity Log</h2>
        {appState.activity.length === 0 ? (
          <p className="chart-empty">No activity data yet</p>
        ) : (
          <div className="chart-wrapper">
            <Line
              data={{
                labels: appState.activity.map((a) => a.timestamp),
                datasets: [
                  {
                    label: "Clients",
                    data: appState.activity.map((a) => a.clients),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: "rgba(37, 99, 235, 1)",
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
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      title: (items) => items[0]?.label || "",
                      label: (item) => `${item.raw} clients`,
                    },
                  },
                },
                scales: {
                  x: {
                    display: true,
                    ticks: {
                      maxTicksLimit: 10,
                      maxRotation: 0,
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

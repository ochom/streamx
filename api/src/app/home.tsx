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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Stream Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Active Last Hour
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {appState.active_clients}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Active Last 6 Hours
          </p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {appState.active_last_hour}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Active Last 24 Hours
          </p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {appState.active_last_24_hours}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Messages Last Hour
          </p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {appState.messages_last_hour}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Messages Last 24 Hours
          </p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {appState.messages_last_24_hours}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Activity Log
        </h2>
        {appState.activity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity data yet</p>
        ) : (
          <div className="relative h-64">
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

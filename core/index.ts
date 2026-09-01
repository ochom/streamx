import { join } from "path";
import Index from "./src/app/index.html";
import { subcribeToChannel } from "./src/core/clients";
import { publish } from "./src/core/redisClient";
import type { Message } from "./src/core/types";

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = process.env.PUBSUB_ALLOWED_ORIGINS
  ? process.env.PUBSUB_ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const allowedIPs = process.env.PUBSUB_ALLOWED_IPS
  ? process.env.PUBSUB_ALLOWED_IPS.split(",")
      .map((ip) => ip.trim())
      .filter(Boolean)
  : [];

const publishAuthUser = process.env.PUBSUB_AUTH_USER?.trim() ?? "";
const publishAuthPass = process.env.PUBSUB_AUTH_PASS?.trim() ?? "";
const enforcePublishBasicAuth =
  publishAuthUser.length > 0 && publishAuthPass.length > 0;
const enforceSubscribeOrigin = allowedOrigins.length > 0;
const enforcePublisherIP = allowedIPs.length > 0;

const unauthorized = () =>
  new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="streamx"',
    },
  });

const isBasicAuthValid = (req: Request) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64Credentials = authHeader.slice("Basic ".length);
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const separatorIndex = credentials.indexOf(":");
  if (separatorIndex < 0) {
    return false;
  }

  const username = credentials.slice(0, separatorIndex);
  const password = credentials.slice(separatorIndex + 1);
  return username === publishAuthUser && password === publishAuthPass;
};

const resolveAllowedOrigin = (req: Request) => {
  if (!enforceSubscribeOrigin) {
    return "*";
  }

  const origin = req.headers.get("origin")?.trim();
  if (!origin) {
    return null;
  }

  return allowedOrigins.includes(origin) ? origin : null;
};

const forbiddenOrigin = () => {
  return new Response("Forbidden origin", { status: 403 });
};

const resolveClientIP = (req: Request): string[] => {
  const xForwardedFor = req.headers.get("X-Forwarded-For");
  if (xForwardedFor) {
    return xForwardedFor.split(",").map((ip) => ip.trim());
  }
  const cfConnectingIP = req.headers.get("CF-Connecting-IP");
  if (cfConnectingIP) {
    return [cfConnectingIP.trim()];
  }
  return []; // No IP found
};

const isIPAllowed = (req: Request) => {
  if (!enforcePublisherIP) {
    return true;
  }

  const clientIP = resolveClientIP(req);
  if (!clientIP || clientIP.length === 0) {
    return false;
  }

  return clientIP.some((ip) => allowedIPs.includes(ip));
};

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  development: isDev,
  routes: {
    "/": Index,
    "/auth": {
      POST: async (req) => {
        const { username, password } = await req.json();
        const [systemUser, systemPass] = [
          process.env.AUTH_USER,
          process.env.AUTH_PASS,
        ];
        if (username === systemUser && password === systemPass) {
          return new Response("Authenticated");
        } else {
          return new Response("Authentication failed", { status: 401 });
        }
      },
    },
    "/health": () =>
      new Response(
        JSON.stringify({
          status: "ok",
        }),
      ),
    "/publish": {
      POST: async (req) => {
        if (!isIPAllowed(req)) {
          return new Response("Forbidden IP", { status: 403 });
        }

        if (enforcePublishBasicAuth && !isBasicAuthValid(req)) {
          return unauthorized();
        }

        const message = (await req.json()) as Message;
        if (!message.data) {
          message.data = message.message;
        }

        let msgBody;
        if (typeof message.data === "object") {
          msgBody = JSON.stringify(message.data);
        } else {
          msgBody = String(message.data);
        }

        await publish(message.topic, {
          event: message.topic,
          data: msgBody,
        });
        return new Response("Message published");
      },
    },
    "/subscribe/:channelID": async (req) => {
      const origin = resolveAllowedOrigin(req);
      if (origin === null) {
        return forbiddenOrigin();
      }

      const { channelID } = req.params;
      return subcribeToChannel(channelID, origin);
    },
    /**
     * @deprecated This endpoint is deprecated and will be removed in future versions.
     * Please use /subscribe/:channelID instead.
     *
     */
    "/subscribe/:apiKey/:instanceID/:channelID": async (req) => {
      const origin = resolveAllowedOrigin(req);
      if (origin === null) {
        return forbiddenOrigin();
      }

      const { channelID } = req.params;
      return subcribeToChannel(channelID, origin);
    },
  },
  // Serve static assets (CSS/JS) for unmatched routes in production
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = join(import.meta.dir, url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not Found", { status: 404 });
  },
});
console.log(`SSE server running at http://localhost:${server.port}`);

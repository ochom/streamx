import Index from "./src/app/index.html";
import { sseEvents, subcribeToChannel } from "./src/core/clients";
import { AddMessageCount } from "./src/core/database";
import type { Message } from "./src/core/types";

const server = Bun.serve({
  development: true,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
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
        const body = (await req.json()) as Message;
        if (!body.data) {
          body.data = body.message;
        }

        sseEvents.emit("message", body);
        AddMessageCount();
        return new Response("Message published");
      },
    },
    "/subscribe/:channelID": async (req) => {
      const { channelID } = req.params;
      return subcribeToChannel(channelID, req);
    },
    "/subscribe/:apiKey/:instanceID/:channelID": async (req) => {
      const { channelID } = req.params;
      return subcribeToChannel(channelID, req);
    },
  },
});
console.log(`SSE server running at http://localhost:${server.port}`);

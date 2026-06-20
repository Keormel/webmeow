import { Response } from "express";
import { IslandEvent } from "./types.js";

const clients: Response[] = [];

export function addClient(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();

  clients.push(res);

  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  res.on("close", () => {
    removeClient(res);
  });
}

export function removeClient(res: Response) {
  const index = clients.indexOf(res);

  if (index > -1) {
    clients.splice(index, 1);
  }
}

export function broadcast(event: IslandEvent) {
  clients.forEach((client) => {
    client.write(
      `event: ${event.type}\n` +
      `data: ${JSON.stringify(event)}\n\n`
    );
  });

  console.log("Broadcasted:", event.type);
}
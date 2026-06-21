import { useEffect, useRef, useState } from "react";

import { env } from "@/config/env";
import { useEventsStore } from "@/stores/events-store";
import { ChannelId } from "@/types/broadcast";
import { BroadcastEventSchema } from "@/types/broadcast";
import type { BroadcastEvent, ConnectionStatus } from "@/types/broadcast";

const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

const BROADCAST_PATH = "/api/broadcast/events";
const SSE_EVENT_TYPES = [
  "airport.arrival",
  "hotel.reservation_confirmed",
  "hotel.reservation_cancelled",
  "beach.activity_full",
  "beach.activity_available",
  "public.announcement",
  "resort.announcement",
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function channelFromSource(source: unknown): ChannelId {
  switch (source) {
    case "airport":
      return ChannelId.Airport;
    case "hotel":
      return ChannelId.Hotel;
    case "beach":
      return ChannelId.Beach;
    case "parrot":
      return ChannelId.Parrot;
    case "broadcast":
      return ChannelId.Broadcast;
    default:
      return ChannelId.ResortWide;
  }
}

function normalizeIslandEvent(raw: unknown): BroadcastEvent | null {
  const parsed = BroadcastEventSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const event = asRecord(raw);
  if (typeof event.id !== "string" || typeof event.type !== "string") {
    return null;
  }

  const payload = asRecord(event.payload);
  const body = asRecord(payload.body);
  const nestedPayload = asRecord(body.payload);
  const directPayload = Object.keys(nestedPayload).length > 0
    ? nestedPayload
    : asRecord(body.data);
  const message =
    typeof nestedPayload.message === "string"
      ? nestedPayload.message
      : typeof body.message === "string"
        ? body.message
        : typeof payload.message === "string"
          ? payload.message
          : event.type;
  const sender =
    typeof payload.sender === "string"
      ? payload.sender
      : typeof event.source === "string"
        ? event.source
        : "broadcast";

  return {
    id: event.id,
    channel: channelFromSource(event.source),
    event_type: event.type,
    message,
    sender,
    guest_id:
      typeof nestedPayload.guest_id === "string"
        ? nestedPayload.guest_id
        : typeof directPayload.guest_id === "string"
          ? directPayload.guest_id
          : undefined,
    data: {
      timestamp: event.timestamp,
      payload,
    },
  };
}

export function useBroadcast() {
  const [status, setStatus] = useState<ConnectionStatus>(() => {
    if (!env.gatewayUrl) {
      console.warn(
        "[useBroadcast] VITE_GATEWAY_URL is not set — SSE connections skipped"
      );
      return "dropped";
    }
    return "reconnecting";
  });
  const connectionRef = useRef<EventSource | null>(null);
  const backoffRef = useRef(BACKOFF_INITIAL_MS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    if (!env.gatewayUrl) return;

    activeRef.current = true;

    function connect() {
      if (!activeRef.current) return;

      const base = env.gatewayUrl.replace(/\/+$/, "");
      const es = new EventSource(`${base}${BROADCAST_PATH}`);
      connectionRef.current = es;

      es.onopen = () => {
        backoffRef.current = BACKOFF_INITIAL_MS;
        setStatus("connected");
      };

      const handleMessage = (e: MessageEvent) => {
        try {
          const event = normalizeIslandEvent(JSON.parse(e.data as string));
          if (event) {
            useEventsStore
              .getState()
              .ingestEvent(event, { mirrorToResortWide: true });
          }
        } catch {
          // malformed payload
        }
      };
      es.onmessage = handleMessage;
      SSE_EVENT_TYPES.forEach((eventType) => {
        es.addEventListener(eventType, handleMessage);
      });

      es.onerror = () => {
        es.close();
        connectionRef.current = null;
        setStatus("reconnecting");

        if (!activeRef.current) return;

        const current = backoffRef.current;
        backoffRef.current = Math.min(current * 2, BACKOFF_MAX_MS);

        timerRef.current = setTimeout(() => {
          if (activeRef.current) connect();
        }, current);
      };
    }

    connect();

    // EventSource is closed automatically on unmount
  }, []);

  return { status };
}

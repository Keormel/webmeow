import { useEffect, useRef, useState } from "react";

import { env } from "@/config/env";
import {
  BROADCAST_SSE_EVENT_TYPES,
  IslandEventSchema,
  mapIslandEventToBroadcastEvent,
} from "@/features/broadcast/lib/map-island-event";
import { useEventsStore } from "@/stores/events-store";
import { ChannelId, type ConnectionStatus } from "@/types/broadcast";

const BACKOFF_INITIAL_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;

const BROADCAST_PATH = "/api/broadcast/events";

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

    function ingestRawPayload(raw: string) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return;
      }

      const island = IslandEventSchema.safeParse(parsed);
      if (!island.success) {
        return;
      }

      const event = mapIslandEventToBroadcastEvent(island.data);
      const fanOut = island.data.type === "resort-wide.announcement";

      useEventsStore.getState().ingestEvent(event, {
        mirrorToResortWide:
          !fanOut &&
          event.channel !== ChannelId.ResortWide &&
          event.channel !== ChannelId.Broadcast,
        fanOutToAllZones: fanOut,
      });
    }

    function connect() {
      if (!activeRef.current) return;

      const base = env.gatewayUrl.replace(/\/+$/, "");
      const es = new EventSource(`${base}${BROADCAST_PATH}`);
      connectionRef.current = es;

      es.onopen = () => {
        backoffRef.current = BACKOFF_INITIAL_MS;
        setStatus("connected");
      };

      es.addEventListener("connected", () => {
        setStatus("connected");
      });

      for (const eventType of BROADCAST_SSE_EVENT_TYPES) {
        es.addEventListener(eventType, (e: Event) => {
          ingestRawPayload((e as MessageEvent<string>).data);
        });
      }

      es.onmessage = (e: MessageEvent) => {
        ingestRawPayload(e.data as string);
      };

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

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      connectionRef.current?.close();
      connectionRef.current = null;
    };
  }, []);

  return { status };
}

import { ChannelId, type BroadcastEvent } from "@/types/broadcast";

export const IslandEventSchema = {
  safeParse(value: unknown) {
    if (!value || typeof value !== "object") {
      return { success: false as const };
    }
    const record = value as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      typeof record.type !== "string" ||
      typeof record.timestamp !== "string" ||
      typeof record.source !== "string"
    ) {
      return { success: false as const };
    }
    return {
      success: true as const,
      data: {
        id: record.id,
        type: record.type,
        timestamp: record.timestamp,
        source: record.source,
        payload: record.payload,
      },
    };
  },
};

export type IslandEvent = {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  payload: unknown;
};

export const BROADCAST_SSE_EVENT_TYPES = [
  "airport.arrival",
  "hotel.reservation_confirmed",
  "hotel.reservation_cancelled",
  "beach.activity_full",
  "beach.activity_available",
  "public.announcement",
  "resort-wide.announcement",
] as const;

export const RESORT_GUEST_VISIBLE_PREFIXES = ["public.", "resort-wide."] as const;

function channelForEventType(type: string): ChannelId {
  if (type.startsWith("airport.")) return ChannelId.Airport;
  if (type.startsWith("hotel.")) return ChannelId.Hotel;
  if (type.startsWith("beach.")) return ChannelId.Beach;
  if (type.startsWith("resort-wide.") || type.startsWith("public.")) {
    return ChannelId.ResortWide;
  }
  return ChannelId.Broadcast;
}

function readMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  const body = record.body;
  if (body && typeof body === "object") {
    const bodyRecord = body as Record<string, unknown>;
    if (typeof bodyRecord.message === "string" && bodyRecord.message.trim()) {
      return bodyRecord.message;
    }

    const nested = bodyRecord.payload;
    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      if (
        typeof nestedRecord.message === "string" &&
        nestedRecord.message.trim()
      ) {
        return nestedRecord.message;
      }
    }
  }

  return null;
}

function readGuestFields(payload: unknown): {
  guest_id?: string;
  guest_name?: string;
} {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const record = payload as Record<string, unknown>;
  const body =
    record.body && typeof record.body === "object"
      ? (record.body as Record<string, unknown>)
      : record;
  const data =
    body.data && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : body.payload && typeof body.payload === "object"
        ? (body.payload as Record<string, unknown>)
        : body;

  return {
    guest_id:
      typeof data.guest_id === "string" ? data.guest_id : undefined,
    guest_name:
      typeof data.name === "string"
        ? data.name
        : typeof data.guest_name === "string"
          ? data.guest_name
          : undefined,
  };
}

export function mapIslandEventToBroadcastEvent(
  event: IslandEvent
): BroadcastEvent {
  const { guest_id, guest_name } = readGuestFields(event.payload);

  return {
    id: event.id,
    channel: channelForEventType(event.type),
    event_type: event.type,
    message: readMessage(event.payload) ?? event.type.replaceAll(".", " "),
    sender: event.source,
    guest_id,
    guest_name,
    data:
      event.payload && typeof event.payload === "object"
        ? (event.payload as Record<string, unknown>)
        : undefined,
  };
}

export function isResortAnnouncementVisibleToGuest(eventType: string): boolean {
  return RESORT_GUEST_VISIBLE_PREFIXES.some((prefix) =>
    eventType.startsWith(prefix)
  );
}

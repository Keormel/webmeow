import { useState } from "react";
import {
  IconArrowLeft,
  IconLoader2,
  IconRocket,
  IconSend,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { publishAdminAnnouncement } from "@/features/broadcast/api/broadcast-client";
import { EventLog } from "@/features/map/components/event-log";
import { IslandId, ZoneId } from "@/features/map/constants";
import { getZone } from "@/features/map/zone-registry";
import { env } from "@/config/env";
import { useEventsStore } from "@/stores/events-store";
import { useSessionStore } from "@/stores/session-store";
import { useIsAdmin } from "@/stores/session-selectors";

const { channel } = getZone(ZoneId.Broadcast);
const PUBLIC_EVENT_PREFIX = "public.";
const RESORT_ANNOUNCEMENT_TYPE = "resort.announcement";

interface BroadcastPanelProps {
  currentIslandId: IslandId;
  onIslandChange: (islandId: IslandId) => void;
}

export function BroadcastPanel({
  currentIslandId,
  onIslandChange,
}: BroadcastPanelProps) {
  const isAdmin = useIsAdmin();
  const session = useSessionStore((s) => s.session);
  const events = useEventsStore((s) => s.events[channel]);
  const [message, setMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const isAlienIsland = currentIslandId === IslandId.Alien;
  const targetIslandId = isAlienIsland ? IslandId.Purrlington : IslandId.Alien;
  const TravelIcon = isAlienIsland ? IconArrowLeft : IconRocket;

  const visible = isAdmin
    ? events
    : events.filter((event) =>
        event.event_type.startsWith(PUBLIC_EVENT_PREFIX) ||
        event.event_type === RESORT_ANNOUNCEMENT_TYPE
      );

  async function handlePublish() {
    const trimmed = message.trim();
    if (!isAdmin || !trimmed || isPublishing) return;

    setIsPublishing(true);
    try {
      const sender =
        session?.role === "admin" ? session.displayName : "Admin";
      await publishAdminAnnouncement(trimmed, sender);
      setMessage("");
      toast.success("Announcement broadcast");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Broadcast failed");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => onIslandChange(targetIslandId)}
          className="bg-slate-950 text-white hover:bg-slate-800"
        >
          <TravelIcon size={16} stroke={2.4} />
          {isAlienIsland ? "Return to Purrlington" : "Go to Alien Island"}
        </Button>
      </div>
      {isAdmin && (
        <div className="flex flex-col gap-2 rounded-md border border-border/70 bg-background/70 p-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Resort-wide announcement"
            maxLength={280}
            disabled={isPublishing || !env.adminPasscode}
            className="min-h-20 resize-none rounded-md"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {message.trim().length}/280
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handlePublish}
              disabled={!message.trim() || isPublishing || !env.adminPasscode}
            >
              {isPublishing ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconSend size={14} />
              )}
              Send
            </Button>
          </div>
        </div>
      )}
      <EventLog events={visible} />
    </>
  );
}

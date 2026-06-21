import { IconArrowLeft, IconRocket } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { AdminAnnouncementForm } from "@/features/broadcast/components/admin-announcement-form";
import { isResortAnnouncementVisibleToGuest } from "@/features/broadcast/lib/map-island-event";
import { EventLog } from "@/features/map/components/event-log";
import { IslandId, ZoneId } from "@/features/map/constants";
import { getZone } from "@/features/map/zone-registry";
import { useEventsStore } from "@/stores/events-store";
import { useIsAdmin } from "@/stores/session-selectors";

const { channel } = getZone(ZoneId.Broadcast);

interface BroadcastPanelProps {
  currentIslandId: IslandId;
  onIslandChange: (islandId: IslandId) => void;
}

export function BroadcastPanel({
  currentIslandId,
  onIslandChange,
}: BroadcastPanelProps) {
  const isAdmin = useIsAdmin();
  const events = useEventsStore((s) => s.events[channel]);
  const isAlienIsland = currentIslandId === IslandId.Alien;
  const targetIslandId = isAlienIsland ? IslandId.Purrlington : IslandId.Alien;
  const TravelIcon = isAlienIsland ? IconArrowLeft : IconRocket;

  const visible = isAdmin
    ? events
    : events.filter((event) => isResortAnnouncementVisibleToGuest(event.event_type));

  return (
    <>
      {isAdmin && <AdminAnnouncementForm />}
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
      <EventLog events={visible} />
    </>
  );
}

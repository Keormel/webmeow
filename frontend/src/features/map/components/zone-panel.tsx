import { ZonePanelShell } from "@/features/map/components/zone-panel-shell";
import { AirportPanel } from "@/features/airport/components/airport-panel";
import { HotelPanel } from "@/features/hotel/components/hotel-panel";
import { BeachPanel } from "@/features/beach/components/beach-panel";
import { ParrotPanel } from "@/features/parrot/components/parrot-panel";
import { BroadcastPanel } from "@/features/broadcast/components/broadcast-panel";
import { IslandId, ZoneId } from "@/features/map/constants";

interface ZonePanelProps {
  zoneId: ZoneId | null;
  open: boolean;
  onClose: () => void;
  currentIslandId: IslandId;
  onIslandChange: (islandId: IslandId) => void;
}

interface ZonePanelContentProps {
  zoneId: ZoneId;
  currentIslandId: IslandId;
  onIslandChange: (islandId: IslandId) => void;
}

function ZonePanelContent({
  zoneId,
  currentIslandId,
  onIslandChange,
}: ZonePanelContentProps) {
  switch (zoneId) {
    case ZoneId.Airport:
      return <AirportPanel />;
    case ZoneId.Hotel:
      return <HotelPanel />;
    case ZoneId.Beach:
      return <BeachPanel />;
    case ZoneId.Parrot:
      return <ParrotPanel />;
    case ZoneId.Broadcast:
      return (
        <BroadcastPanel
          currentIslandId={currentIslandId}
          onIslandChange={onIslandChange}
        />
      );
  }
}

export function ZonePanel({
  zoneId,
  open,
  onClose,
  currentIslandId,
  onIslandChange,
}: ZonePanelProps) {
  return (
    <ZonePanelShell zoneId={zoneId} open={open} onClose={onClose}>
      {zoneId && (
        <ZonePanelContent
          zoneId={zoneId}
          currentIslandId={currentIslandId}
          onIslandChange={onIslandChange}
        />
      )}
    </ZonePanelShell>
  );
}

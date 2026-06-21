import { useCallback, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { ConnectionStatus } from "@/features/broadcast/components/connection-status";
import { GuestHud } from "@/features/map/components/guest-hud";
import { IslandTitle } from "@/features/map/components/island-title";
import { ZoneLayer } from "@/features/map/components/zone-layer";
import { ZonePanel } from "@/features/map/components/zone-panel";
import { IslandId, MAP_H, MAP_W, ZoneId } from "@/features/map/constants";
import { getIsland } from "@/features/map/zone-registry";
import { useBroadcast } from "@/features/broadcast/hooks/use-broadcast";
import { useMapDimensions } from "@/features/map/hooks/use-map-dimensions";
import { QuestGuide } from "@/features/quests/components/quest-guide";
import { useQuestProgress } from "@/features/quests/hooks/use-quest-progress";
import { useQuestStore } from "@/features/quests/quest-store";
import { useTrafficGenerator } from "@/features/simulation/hooks/use-traffic-generator";
import { useGuest } from "@/stores/session-selectors";

export function MapPage() {
  const { w, h, minScale } = useMapDimensions();

  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [currentIslandId, setCurrentIslandId] = useState<IslandId>(
    IslandId.Purrlington
  );
  const guest = useGuest();
  const markZoneVisited = useQuestStore((state) => state.markZoneVisited);
  const { activeZoneId: questTargetId } = useQuestProgress();
  const island = getIsland(currentIslandId);

  const { status } = useBroadcast();
  useTrafficGenerator();

  const panelOpen = activeZone !== null;

  const openZone = useCallback(
    (zoneId: ZoneId) => {
      if (guest) {
        markZoneVisited(guest.id, zoneId);
      }

      setActiveZone(zoneId);
    },
    [guest, markZoneVisited]
  );

  const travelToIsland = useCallback((islandId: IslandId) => {
    setCurrentIslandId(islandId);
    setActiveZone(null);
  }, []);

  return (
    <div
      data-island={currentIslandId}
      className={
        island.tone === "dark"
          ? "fixed inset-0 overflow-hidden bg-[#020713]"
          : "fixed inset-0 overflow-hidden"
      }
    >
      <img
        src={island.oceanSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0">
        <TransformWrapper
          key={currentIslandId}
          initialScale={minScale}
          minScale={minScale * 0.5}
          maxScale={3}
          limitToBounds={false}
          centerOnInit
          wheel={{ step: 0.001 }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="cursor-grab active:cursor-grabbing"
          >
            <div className="relative" style={{ width: w, height: h }}>
              <img
                src={island.mapSrc}
                width={w}
                height={h}
                alt={island.mapAlt}
                draggable={false}
                className="block select-none"
              />
              {island.decorations?.map((decoration) => (
                <img
                  key={`${island.id}-${decoration.src}`}
                  src={decoration.src}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute select-none"
                  style={{
                    left: `${(decoration.position.x / MAP_W) * 100}%`,
                    top: `${(decoration.position.y / MAP_H) * 100}%`,
                    width: `${(decoration.width / MAP_W) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    filter: "drop-shadow(0 0 24px rgba(112, 199, 255, 0.38))",
                  }}
                />
              ))}
              <ZoneLayer
                islandId={currentIslandId}
                mapW={w}
                mapH={h}
                questTargetId={questTargetId}
                onZoneClick={openZone}
              />
            </div>
          </TransformComponent>
        </TransformWrapper>

        <GuestHud />
      </div>

      <IslandTitle title={island.title} />

      <ConnectionStatus status={status} />

      <QuestGuide onOpenZone={openZone} />

      <ZonePanel
        zoneId={activeZone}
        open={panelOpen}
        onClose={() => setActiveZone(null)}
        currentIslandId={currentIslandId}
        onIslandChange={travelToIsland}
      />
    </div>
  );
}

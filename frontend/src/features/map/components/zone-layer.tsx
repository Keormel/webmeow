import {
  MAP_H,
  MAP_W,
  ZONE_HIT_RADIUS,
  ZoneId,
} from "@/features/map/constants";
import { ZoneIndicator } from "@/features/map/components/zone-indicator";
import { getZone } from "@/features/map/zone-registry";

interface ZoneLayerProps {
  mapW: number;
  mapH: number;
  questTargetId?: ZoneId | null;
  onZoneClick?: (id: ZoneId) => void;
}

export function ZoneLayer({
  mapW,
  mapH,
  questTargetId,
  onZoneClick,
}: ZoneLayerProps) {
  const scaleX = mapW / MAP_W;
  const scaleY = mapH / MAP_H;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className="pointer-events-none absolute inset-0">
      {Object.values(ZoneId).map((id) => {
        const zone = getZone(id);
        return (
          <ZoneIndicator
            key={id}
            id={id}
            x={zone.position.x * scaleX}
            y={zone.position.y * scaleY}
            radius={ZONE_HIT_RADIUS * scale}
            label={zone.label}
            accent={zone.accent}
            markerSrc={zone.markerSrc}
            markerScale={zone.markerScale}
            isQuestTarget={questTargetId === id}
            onClick={onZoneClick}
          />
        );
      })}
    </div>
  );
}

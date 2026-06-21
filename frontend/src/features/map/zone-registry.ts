import type { Icon } from "@tabler/icons-react";
import {
  IconPlaneDeparture,
  IconBed,
  IconUmbrella,
  IconFeather,
  IconBuildingLighthouse,
} from "@tabler/icons-react";
import islandBg from "@/assets/island-bg.svg";
import oceanBg from "@/assets/ocean-bg.svg";
import airportZoneArt from "@/assets/zones/airport.svg";
import beachZoneArt from "@/assets/zones/beach.svg";
import hotelZoneArt from "@/assets/zones/hotel.svg";
import lighthouseZoneArt from "@/assets/zones/lighthouse.svg";
import parrotZoneArt from "@/assets/zones/parrot.svg";
import alienArt from "../../../assets/island/alien.svg";
import alienIslandBg from "../../../assets/island/moon-island-bg.svg";
import spaceAirportZoneArt from "../../../assets/island/space-airport.svg";
import spaceBeachZoneArt from "../../../assets/island/space-beach.svg";
import spaceHotelZoneArt from "../../../assets/island/space-hotel.svg";
import spaceLighthouseZoneArt from "../../../assets/island/space-lighthouse.svg";
import spaceOceanBg from "../../../assets/island/space-ocean-bg.svg";
import spaceParrotZoneArt from "../../../assets/island/space-parrot.svg";
import { IslandId, ZoneId } from "@/features/map/constants";
import { ChannelId } from "@/types/broadcast";

export interface ZoneDefinition {
  id: ZoneId;
  label: string;
  description: string;
  adminDescription: string;
  icon: Icon;
  channel: ChannelId;
  position: {
    x: number;
    y: number;
  };
  accent: string;
  markerSrc: string;
  markerScale?: number;
}

export interface IslandZonePlacement {
  position: ZoneDefinition["position"];
  markerSrc: string;
  markerScale?: number;
}

export interface IslandDecoration {
  src: string;
  position: {
    x: number;
    y: number;
  };
  width: number;
}

export interface IslandDefinition {
  id: IslandId;
  title: string;
  oceanSrc: string;
  mapSrc: string;
  mapAlt: string;
  tone: "light" | "dark";
  zones: Record<ZoneId, IslandZonePlacement>;
  decorations?: IslandDecoration[];
}

export const ZONE_REGISTRY: Record<ZoneId, ZoneDefinition> = {
  [ZoneId.Airport]: {
    id: ZoneId.Airport,
    label: "Airport",
    description:
      "Join the departure queue and clear passport control. You can't check in anywhere until you've landed.",
    adminDescription:
      "Observe airport arrivals, queue movement, and passport-control events.",
    icon: IconPlaneDeparture,
    channel: ChannelId.Airport,
    position: { x: 1600, y: 320 },
    accent: "#38bdf8",
    markerSrc: airportZoneArt,
    markerScale: 2,
  },
  [ZoneId.Hotel]: {
    id: ZoneId.Hotel,
    label: "Hotel",
    description:
      "Reserve a room for your stay. The hotel checks you've cleared the airport first.",
    adminDescription:
      "Observe hotel room, reservation, and cancellation events.",
    icon: IconBed,
    channel: ChannelId.Hotel,
    position: { x: 1720, y: 900 },
    markerSrc: hotelZoneArt,
    accent: "#34d399",
    markerScale: 1.65,
  },
  [ZoneId.Beach]: {
    id: ZoneId.Beach,
    label: "Beach",
    description:
      "Browse activities and grab a spot. Each has limited capacity and guests can only join one at a time.",
    adminDescription:
      "Observe beach activity capacity, booking, and cancellation events.",
    icon: IconUmbrella,
    channel: ChannelId.Hotel,
    position: { x: 580, y: 1400 },
    accent: "#fbbf24",
    markerSrc: beachZoneArt,
    markerScale: 1,
  },
  [ZoneId.Parrot]: {
    id: ZoneId.Parrot,
    label: "Parrot",
    description:
      "Chat with the resort's AI parrot for island guidance, recommendations, and quick answers.",
    adminDescription:
      "Observe the AI parrot's activity: chat volume, tool usage, and conversation transcripts.",
    icon: IconFeather,
    channel: ChannelId.Parrot,
    position: { x: 2380, y: 1560 },
    accent: "#a78bfa",
    markerSrc: parrotZoneArt,
    markerScale: 1,
  },
  [ZoneId.Broadcast]: {
    id: ZoneId.Broadcast,
    label: "Lighthouse",
    description:
      "Resort-wide announcements broadcast to every guest on the island.",
    adminDescription:
      "Observe the full island-wide event stream from every service.",
    icon: IconBuildingLighthouse,
    channel: ChannelId.ResortWide,
    position: { x: 375, y: 890 },
    accent: "#22d3ee",
    markerSrc: lighthouseZoneArt,
    markerScale: 2,
  },
};

function getZonePlacement(zone: ZoneDefinition): IslandZonePlacement {
  return {
    position: zone.position,
    markerSrc: zone.markerSrc,
    markerScale: zone.markerScale,
  };
}

export const ISLAND_REGISTRY: Record<IslandId, IslandDefinition> = {
  [IslandId.Purrlington]: {
    id: IslandId.Purrlington,
    title: "Purrlington",
    oceanSrc: oceanBg,
    mapSrc: islandBg,
    mapAlt: "Purrlington island map",
    tone: "light",
    zones: {
      [ZoneId.Airport]: getZonePlacement(ZONE_REGISTRY[ZoneId.Airport]),
      [ZoneId.Hotel]: getZonePlacement(ZONE_REGISTRY[ZoneId.Hotel]),
      [ZoneId.Beach]: getZonePlacement(ZONE_REGISTRY[ZoneId.Beach]),
      [ZoneId.Parrot]: getZonePlacement(ZONE_REGISTRY[ZoneId.Parrot]),
      [ZoneId.Broadcast]: getZonePlacement(ZONE_REGISTRY[ZoneId.Broadcast]),
    },
  },
  [IslandId.Alien]: {
    id: IslandId.Alien,
    title: "Alien Island",
    oceanSrc: spaceOceanBg,
    mapSrc: alienIslandBg,
    mapAlt: "Alien island map",
    tone: "dark",
    zones: {
      [ZoneId.Airport]: {
        position: { x: 1600, y: 330 },
        markerSrc: spaceAirportZoneArt,
        markerScale: 2,
      },
      [ZoneId.Hotel]: {
        position: { x: 1740, y: 890 },
        markerSrc: spaceHotelZoneArt,
        markerScale: 1.65,
      },
      [ZoneId.Beach]: {
        position: { x: 580, y: 1410 },
        markerSrc: spaceBeachZoneArt,
        markerScale: 1,
      },
      [ZoneId.Parrot]: {
        position: { x: 2380, y: 1560 },
        markerSrc: spaceParrotZoneArt,
        markerScale: 1,
      },
      [ZoneId.Broadcast]: {
        position: { x: 375, y: 890 },
        markerSrc: spaceLighthouseZoneArt,
        markerScale: 1.8,
      },
    },
    decorations: [
      {
        src: alienArt,
        position: { x: 2570, y: 430 },
        width: 260,
      },
    ],
  },
};

export function getZone(id: ZoneId) {
  return ZONE_REGISTRY[id];
}

export function getIsland(id: IslandId) {
  return ISLAND_REGISTRY[id];
}

export function getIslandZone(id: ZoneId, islandId: IslandId) {
  return {
    ...getZone(id),
    ...getIsland(islandId).zones[id],
  };
}

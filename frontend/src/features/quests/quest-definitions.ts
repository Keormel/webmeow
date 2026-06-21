import type { Icon } from "@tabler/icons-react";
import {
  IconBed,
  IconFeather,
  IconPlaneDeparture,
  IconSpeakerphone,
  IconUmbrella,
} from "@tabler/icons-react";

import { ZoneId } from "@/features/map/constants";

export type QuestStepId =
  | "airport"
  | "hotel"
  | "beach"
  | "parrot"
  | "broadcast";

export interface QuestRewardDefinition {
  label: string;
  assetFileName: string;
  fallbackAssetFileName?: string;
  placement: "head" | "neck" | "body" | "left-hand" | "right-hand";
  layer: {
    left: string;
    top: string;
    width: string;
  };
}

export interface QuestStepDefinition {
  id: QuestStepId;
  zoneId: ZoneId;
  title: string;
  description: string;
  actionLabel: string;
  completedLabel: string;
  icon: Icon;
  reward?: QuestRewardDefinition;
}

export const QUEST_STEPS: QuestStepDefinition[] = [
  {
    id: "airport",
    zoneId: ZoneId.Airport,
    title: "Clear passport control",
    description: "Open the airport and board the flight to enter the island.",
    actionLabel: "Go to Airport",
    completedLabel: "Landed",
    icon: IconPlaneDeparture,
  },
  {
    id: "hotel",
    zoneId: ZoneId.Hotel,
    title: "Book a room",
    description: "Check into the hotel so the rest of the resort opens up.",
    actionLabel: "Go to Hotel",
    completedLabel: "Room booked",
    icon: IconBed,
    reward: {
      label: "Hotel badge",
      assetFileName: "2 hotel.svg",
      fallbackAssetFileName: "hotel.svg",
      placement: "left-hand",
      layer: {
        left: "5%",
        top: "55%",
        width: "30%",
      },
    },
  },
  {
    id: "beach",
    zoneId: ZoneId.Beach,
    title: "Choose a beach activity",
    description: "Pick any available beach activity and claim a spot.",
    actionLabel: "Go to Beach",
    completedLabel: "Activity booked",
    icon: IconUmbrella,
    reward: {
      label: "Beach garland",
      assetFileName: "2 beach.svg",
      placement: "neck",
      layer: {
        left: "13%",
        top: "37%",
        width: "74%",
      },
    },
  },
  {
    id: "parrot",
    zoneId: ZoneId.Parrot,
    title: "Ask the island assistant",
    description: "Send the parrot one question about queues, rooms, or plans.",
    actionLabel: "Go to Parrot",
    completedLabel: "Question asked",
    icon: IconFeather,
    reward: {
      label: "Parrot plume",
      assetFileName: "2 parrot.svg",
      placement: "head",
      layer: {
        left: "5%",
        top: "-2%",
        width: "90%",
      },
    },
  },
  {
    id: "broadcast",
    zoneId: ZoneId.Broadcast,
    title: "Check live announcements",
    description: "Open the lighthouse feed to see island-wide resort events.",
    actionLabel: "Go to Lighthouse",
    completedLabel: "Feed checked",
    icon: IconSpeakerphone,
    reward: {
      label: "Lighthouse charm",
      assetFileName: "2 lighthouse.svg",
      placement: "right-hand",
      layer: {
        left: "57%",
        top: "53%",
        width: "35%",
      },
    },
  },
];

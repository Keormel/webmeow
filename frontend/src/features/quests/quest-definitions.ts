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

export interface QuestStepDefinition {
  id: QuestStepId;
  zoneId: ZoneId;
  title: string;
  description: string;
  actionLabel: string;
  completedLabel: string;
  icon: Icon;
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
  },
  {
    id: "beach",
    zoneId: ZoneId.Beach,
    title: "Choose a beach activity",
    description: "Pick any available beach activity and claim a spot.",
    actionLabel: "Go to Beach",
    completedLabel: "Activity booked",
    icon: IconUmbrella,
  },
  {
    id: "parrot",
    zoneId: ZoneId.Parrot,
    title: "Ask the island assistant",
    description: "Send the parrot one question about queues, rooms, or plans.",
    actionLabel: "Go to Parrot",
    completedLabel: "Question asked",
    icon: IconFeather,
  },
  {
    id: "broadcast",
    zoneId: ZoneId.Broadcast,
    title: "Check live announcements",
    description: "Open the lighthouse feed to see island-wide resort events.",
    actionLabel: "Go to Lighthouse",
    completedLabel: "Feed checked",
    icon: IconSpeakerphone,
  },
];

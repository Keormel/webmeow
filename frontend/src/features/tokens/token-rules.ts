import type { Activity } from "@/features/beach/types";
import {
  ROOM_PRICE_PER_NIGHT,
  type Reservation,
  type RoomType,
} from "@/features/hotel/types";

export const ROOM_TOKEN_ALLOWANCE_PER_NIGHT: Record<RoomType, number> = {
  STANDARD: 4,
  DELUXE: 8,
  SUITE: 16,
};

const ACTIVITY_TOKEN_COST_BY_ID: Record<string, number> = {
  ACT001: 2,
  ACT002: 5,
  ACT003: 6,
  ACT004: 2,
  ACT005: 4,
  ACT006: 1,
  ACT007: 2,
  ACT008: 9,
  ACT009: 10,
  ACT010: 3,
  ACT011: 5,
  ACT012: 4,
  ACT013: 1,
  ACT014: 3,
  ACT015: 2,
  ACT016: 4,
  ACT017: 5,
  ACT018: 1,
  ACT019: 2,
  ACT020: 7,
  "activity-sunset-cruise": 7,
  "activity-snorkeling": 6,
  "activity-glass-bottom-boat": 5,
  "activity-beach-volleyball": 2,
  "activity-kayaking": 4,
  "activity-beach-yoga": 2,
};

const ACTIVITY_TOKEN_COST_BY_NAME: Record<string, number> = {
  "Beach Volleyball": 2,
  "Surf Lessons": 5,
  "Snorkeling Adventure": 6,
  Snorkeling: 6,
  "Sunrise Yoga": 2,
  "Beach Yoga": 2,
  "Kayaking Tour": 4,
  Kayaking: 4,
  "Sandcastle Competition": 1,
  "Beach Soccer": 2,
  "Scuba Diving": 9,
  "Jet Ski Experience": 10,
  "Beach Bonfire": 3,
  "Fishing Excursion": 5,
  "Paddle Boarding": 4,
  "Nature Walk": 1,
  "Photography Workshop": 3,
  "Treasure Hunt": 2,
  "Cooking Class": 4,
  "Sailing Basics": 5,
  "Beach Cleanup": 1,
  "Meditation Session": 2,
  "Sunset Cruise": 7,
  "Glass-Bottom Boat": 5,
};

export function getPackageTokenAllowance(
  roomType: RoomType,
  nights: number
): number {
  return ROOM_TOKEN_ALLOWANCE_PER_NIGHT[roomType] * Math.max(1, nights);
}

export function getPackagePrice(roomType: RoomType, nights: number): number {
  return ROOM_PRICE_PER_NIGHT[roomType] * Math.max(1, nights);
}

export function getReservationTokenAllowance(reservation: Reservation): number {
  return getPackageTokenAllowance(
    reservation.room_type,
    reservation.check_out_day - reservation.check_in_day
  );
}

export function getActivityTokenCost(activity: Activity): number {
  return (
    ACTIVITY_TOKEN_COST_BY_ID[activity.activity_id] ??
    ACTIVITY_TOKEN_COST_BY_NAME[activity.activity_name] ??
    2
  );
}

export function formatTokens(amount: number): string {
  return `${amount} token${amount === 1 ? "" : "s"}`;
}

export type AirportArrivalStatus = 'queued' | 'processing' | 'processed';

export interface AirportArrivalResponseDto {
  guestId: string;
  status: AirportArrivalStatus;
  gate?: string | null;
  position?: number | null;
  queued_at?: number;
  processed_at?: number | null;
  wait_time_seconds?: number;
}

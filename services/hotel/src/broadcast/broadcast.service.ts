import { Injectable, Logger } from '@nestjs/common';
import { HotelBroadcastEvent, HotelBroadcastEventType } from './hotel-events';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);
  private readonly broadcastServiceUrl = process.env.BROADCAST_SERVICE_URL;
  private readonly broadcastToken = process.env.HOTEL_TOKEN ?? '';

  async publishHotelEvent(
    eventType: HotelBroadcastEventType,
    event: HotelBroadcastEvent,
  ): Promise<void> {
    if (!this.broadcastServiceUrl) {
      return;
    }

    try {
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (this.broadcastToken) {
        headers['X-Service-Token'] = this.broadcastToken;
      }

      const response = await fetch(
        `${this.broadcastServiceUrl}${this.getEndpointForEvent(eventType)}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: eventType, payload: event }),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Failed to publish hotel event ${eventType}: ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Failed to publish hotel event ${eventType}`, error);
    }
  }

  private getEndpointForEvent(eventType: HotelBroadcastEventType): string {
    switch (eventType) {
      case HotelBroadcastEventType.ReservationConfirmed:
        return '/hotel/confirm';
      case HotelBroadcastEventType.ReservationCancelled:
        return '/hotel/cancel';
    }
  }
}

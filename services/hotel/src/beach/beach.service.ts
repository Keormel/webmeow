import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BeachService {
  private readonly logger = new Logger(BeachService.name);
  private readonly beachServiceUrl = process.env.BEACH_SERVICE_URL;
  private readonly serviceToken = process.env.HOTEL_TOKEN ?? '';

  async creditReservationTokens(
    guestId: string,
    reservationId: string,
    amount: number,
  ): Promise<void> {
    if (!this.beachServiceUrl || amount <= 0) {
      return;
    }

    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
      };
      if (this.serviceToken) {
        headers['X-Service-Token'] = this.serviceToken;
      }

      const response = await fetch(
        `${this.beachServiceUrl}/visitor/${encodeURIComponent(guestId)}/tokens/credit`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            reservation_id: reservationId,
            amount,
          }),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Failed to credit beach tokens for ${guestId}: ${response.status}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Failed to credit beach tokens for ${guestId}`, error);
    }
  }
}

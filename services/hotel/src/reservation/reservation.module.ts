import { Module } from '@nestjs/common';
import { AirportModule } from '../airport/airport.module';
import { BeachModule } from '../beach/beach.module';
import { BroadcastModule } from '../broadcast/broadcast.module';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
  imports: [AirportModule, BeachModule, BroadcastModule],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}

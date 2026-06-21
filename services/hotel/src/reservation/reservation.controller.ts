import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { assertGuestMatch, GuestGuard, type GuestRequest } from '../common/guest.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(GuestGuard)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: GuestRequest,
  ) {
    assertGuestMatch(req.guestId, createReservationDto.guest_id);
    return this.reservationService.create(createReservationDto);
  }

  @Get('by-guest/:guest_id')
  @UseGuards(GuestGuard)
  findActiveByGuestId(
    @Param('guest_id') guestId: string,
    @Req() req: GuestRequest,
  ) {
    assertGuestMatch(req.guestId, guestId);
    return this.reservationService.findActiveByGuestId(guestId);
  }

  @Get(':id')
  @UseGuards(GuestGuard)
  findById(@Param('id') id: string, @Req() req: GuestRequest) {
    return this.reservationService.findById(id, req.guestId!);
  }

  @Delete(':id')
  @UseGuards(GuestGuard)
  cancel(@Param('id') id: string, @Req() req: GuestRequest) {
    return this.reservationService.cancel(id, req.guestId!);
  }
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { RoomType } from '../../../generated/prisma/client.js';

export class CreateReservationDto {
  @IsString()
  guest_id!: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  party_guest_ids?: string[];

  @IsEnum(RoomType)
  room_type!: RoomType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guest_count!: number;

  @Type(() => Number)
  @IsInt()
  check_in_day!: number;

  @Type(() => Number)
  @IsInt()
  check_out_day!: number;
}

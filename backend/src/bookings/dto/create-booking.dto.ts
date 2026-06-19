import { IsDateString, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  hotelId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DateRangeQueryDto {
  @ApiProperty({
    example: '2026-05-25',
    description:
      'Start date (ISO 8601). Inclusive from 00:00:00.000 on this day. Can be the same as endDate.',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-05-25',
    description:
      'End date (ISO 8601). Inclusive through 23:59:59.999 on this day. Can be the same as startDate.',
  })
  @IsDateString()
  endDate: string;
}

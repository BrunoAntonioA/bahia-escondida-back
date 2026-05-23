import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @IsBoolean()
  isDelivery: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  tableNumber?: number;

  @IsOptional()
  @IsString()
  customerNickname?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  partySize?: number;
}

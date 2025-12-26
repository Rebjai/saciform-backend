import { IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ResponseStatus } from '../../common/enums';

export class UpdateResponseDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  gpsAccuracy?: number;

  @IsOptional()
  @IsEnum(ResponseStatus)
  status?: ResponseStatus;

  @IsOptional()
  @IsObject()
  answers?: Record<string, any>; // Mismo formato que en Create
}
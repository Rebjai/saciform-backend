import { IsOptional, IsString } from 'class-validator';

export class UpdateMunicipalityDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  district?: string;
}
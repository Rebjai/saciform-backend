import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMunicipalityDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  district: string;
}
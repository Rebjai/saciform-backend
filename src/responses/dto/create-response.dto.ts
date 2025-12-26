import { IsNotEmpty, IsOptional, IsArray, IsNumber, IsString, IsUUID, IsObject } from 'class-validator';

export class CreateResponseDto {
  @IsNotEmpty()
  @IsUUID()
  questionnaireId: string;

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
  @IsObject()
  answers?: Record<string, any>; // { "questionId": "valor", "questionId2": ["opcion1", "opcion2"] }
}
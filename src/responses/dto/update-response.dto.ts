import { IsOptional, IsObject, IsNumber } from 'class-validator';

export class UpdateResponseDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, any>; // Respuestas actualizadas

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Metadata actualizada

  @IsOptional()
  @IsNumber()
  version?: number; // Versión para control de concurrencia
}
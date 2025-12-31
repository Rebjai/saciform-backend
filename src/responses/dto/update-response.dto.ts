
import { IsOptional, IsObject, IsUUID } from 'class-validator';

export class UpdateResponseDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, any>; // Respuestas actualizadas

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Metadata actualizada

  @IsOptional()
  @IsUUID()
  userId?: string; // Usuario específico (para casos administrativos)

  @IsOptional()
  @IsUUID()
  municipalityId?: string; // Asociar respuesta a municipio
}
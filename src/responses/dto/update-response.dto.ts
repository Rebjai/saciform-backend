
import { IsOptional, IsObject, IsUUID, IsEnum } from 'class-validator';
import { ResponseStatus } from '../../common/enums';

export class UpdateResponseDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, any>; // Respuestas actualizadas

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Metadata actualizada

  @IsOptional()
  @IsEnum(ResponseStatus)
  status?: ResponseStatus; // Estado de la respuesta

  @IsOptional()
  @IsUUID()
  userId?: string; // Usuario específico (para casos administrativos)

  @IsOptional()
  @IsUUID()
  municipalityId?: string; // Asociar respuesta a municipio
}
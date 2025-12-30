import { IsNotEmpty, IsOptional, IsString, IsObject, IsUUID, IsEnum } from 'class-validator';
import { ResponseStatus } from '../../common/enums';

export class CreateResponseDto {
  @IsNotEmpty()
  @IsString()
  surveyId: string; // ID del survey (ej: "local_actors_interview_v1")

  @IsNotEmpty()
  @IsObject()
  answers: Record<string, any>; // Respuestas en formato JSON libre

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Metadata opcional (userAgent, location, etc.)

  // Campos según requerimientos
  @IsOptional()
  @IsUUID()
  userId?: string; // Usuario específico (para casos administrativos)

  @IsOptional()
  @IsUUID()
  municipalityId?: string; // Asociar respuesta a municipio

  @IsOptional()
  @IsEnum(ResponseStatus)
  status?: ResponseStatus; // Estado inicial (draft por defecto)
}
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateResponseDto {
  @IsOptional()
  @IsString()
  responseId?: string; // ID opcional, si no se envía se genera automáticamente

  @IsNotEmpty()
  @IsString()
  surveyId: string; // ID del survey (ej: "local_actors_interview_v1")

  @IsNotEmpty()
  @IsObject()
  answers: Record<string, any>; // Respuestas en formato JSON libre

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Metadata opcional (userAgent, location, etc.)
}
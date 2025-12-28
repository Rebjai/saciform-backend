import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @IsString()
  responseId: string; // ID de la respuesta (requerido en producción)

  @IsOptional()
  @IsString()
  fieldName?: string; // Nombre del campo en el cuestionario (ej: "foto_fachada")
}
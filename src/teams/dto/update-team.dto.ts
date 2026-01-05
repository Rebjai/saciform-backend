import { IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un equipo existente
 * Todos los campos son opcionales para permitir actualización parcial
 */
export class UpdateTeamDto {
  @IsOptional()
  @IsString({ message: 'El nombre del equipo debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}
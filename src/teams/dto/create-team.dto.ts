import { IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para crear un nuevo equipo
 * Solo los administradores pueden crear equipos
 */
export class CreateTeamDto {
  @IsString({ message: 'El nombre del equipo es requerido' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}
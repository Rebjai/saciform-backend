import { IsUUID } from 'class-validator';

/**
 * DTO para asignar un equipo a un usuario
 * Solo los administradores pueden asignar equipos
 */
export class AssignTeamDto {
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  @IsUUID('4', { message: 'teamId debe ser un UUID válido' })
  teamId: string;
}
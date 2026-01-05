import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para que editores creen usuarios normales
 * Los editores solo pueden crear usuarios con rol USER
 * y se asignan automáticamente a su equipo
 */
export class EditorCreateUserDto {
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'El nombre es requerido' })
  name: string;

  @IsString({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
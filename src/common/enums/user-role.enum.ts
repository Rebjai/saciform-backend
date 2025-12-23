/**
 * Enum para los roles de usuario en el sistema
 * USER: Usuario básico que puede crear y ver sus propias respuestas
 * EDITOR: Puede ver y modificar respuestas de su equipo
 * ADMIN: Acceso completo al sistema
 */
export enum UserRole {
  USER = 'user',
  EDITOR = 'editor', 
  ADMIN = 'admin',
}
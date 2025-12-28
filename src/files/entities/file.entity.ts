import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entidad File simplificada para manejo de imágenes
 * Usa convenciones para rutas: uploads/originals/{id}.ext y uploads/optimized/{id}.webp
 */
@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  responseId: string;

  @Column()
  filename: string; // Nombre original del archivo

  @Column()
  mimeType: string; // image/jpeg, image/png, etc.

  @Column()
  fileSize: number; // Tamaño en bytes del archivo original

  @CreateDateColumn()
  createdAt: Date;
}
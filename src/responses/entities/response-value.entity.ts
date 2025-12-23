import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Response } from './response.entity';

/**
 * Entidad ResponseValue - Representa el valor de respuesta para una pregunta específica
 * Almacena la respuesta del usuario para cada pregunta individual
 */
@Entity('response_values')
export class ResponseValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  textValue: string; // Para text, textarea

  @Column({ type: 'json', nullable: true })
  selectedOptions: string[]; // Para radio, checkbox, select

  @Column({ type: 'json', nullable: true })
  imageUrls: string[]; // Para imágenes - URLs de archivos

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  gpsLatitude: number; // Para GPS

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  gpsLongitude: number; // Para GPS

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gpsAccuracy: number; // Precisión GPS en metros

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Muchos valores pertenecen a una respuesta
  @ManyToOne(() => Response, (response) => response.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'responseId' })
  response: Response;

  @Column()
  responseId: string;

  // Relación: Muchos valores corresponden a una pregunta
  @ManyToOne('Question', { nullable: false })
  @JoinColumn({ name: 'questionId' })
  question: any;

  @Column()
  questionId: string;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ResponseStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { ResponseValue } from './response-value.entity';

/**
 * Entidad Response - Representa una respuesta completa a un cuestionario
 * Contiene metadatos y estado de la respuesta
 */
@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
    default: ResponseStatus.DRAFT,
  })
  status: ResponseStatus;

  // Coordenadas GPS de la respuesta (si aplica)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gpsAccuracy: number; // Precisión del GPS en metros

  @Column({ type: 'datetime', nullable: true })
  finalizedAt: Date; // Cuándo se marcó como final

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Muchas respuestas pertenecen a un usuario
  @ManyToOne('User', { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column()
  userId: string;

  // Relación: Muchas respuestas pertenecen a un cuestionario
  @ManyToOne('Questionnaire', { nullable: false })
  @JoinColumn({ name: 'questionnaireId' })
  questionnaire: any;

  @Column()
  questionnaireId: string;

  // Relación: Una respuesta tiene muchos valores de respuesta
  @OneToMany(() => ResponseValue, (responseValue) => responseValue.response, {
    cascade: true,
  })
  values: ResponseValue[];
}
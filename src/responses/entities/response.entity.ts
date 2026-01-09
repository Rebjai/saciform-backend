import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ResponseStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad Response - Versión simplificada
 * Representa una respuesta completa a un cuestionario con estructura JSON flexible
 */
@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del survey/cuestionario (puede ser string personalizado como "local_actors_interview_v1")
  @Column({ length: 200 })
  surveyId: string;

  // Respuestas en formato JSON - estructura flexible
  @Column({ type: 'json' })
  answers: Record<string, any>;

  // Metadata opcional en formato JSON
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
    default: ResponseStatus.DRAFT,
  })
  status: ResponseStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Referencias por ID (sin relaciones para simplicidad)
  @Column()
  userId: string;

  // Relación con el usuario que creó la respuesta
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  municipalityId?: string;

  @Column()
  lastModifiedBy: string;
}
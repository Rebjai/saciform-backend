import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';


/**
 * Entidad Questionnaire - Representa las plantillas de cuestionarios
 * Define la estructura y orden de las preguntas
 */
@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Un cuestionario puede tener muchas preguntas
  @OneToMany(() => Question, (question) => question.questionnaire, { 
    cascade: true 
  })
  questions: Question[];

  // Relación: Quién creó el cuestionario
  @ManyToOne('User', { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: any;

  @Column()
  createdById: string;
}
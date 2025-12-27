import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuestionType } from '../../common/enums';
import { Questionnaire } from './questionnaire.entity';

/**
 * Entidad Question - Representa las preguntas individuales
 * Define el tipo, texto y opciones de cada pregunta
 */
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'json', nullable: true })
  options: string[]; // Para radio, checkbox, select - almacena las opciones

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'int' })
  order: number; // Orden de la pregunta en el cuestionario

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Muchas preguntas pertenecen a un cuestionario
  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionnaireId' })
  questionnaire: Questionnaire;

  @Column()
  questionnaireId: string;
}
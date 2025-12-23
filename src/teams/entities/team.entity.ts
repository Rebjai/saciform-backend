import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

/**
 * Entidad Team - Representa los equipos de trabajo
 * Cada usuario pertenece a un equipo
 * Los editores pueden gestionar uno o varios equipos
 */
@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Un equipo puede tener muchos usuarios
  @OneToMany('User', 'team')
  users: any[];
}
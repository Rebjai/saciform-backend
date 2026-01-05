import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import * as bcrypt from 'bcrypt';

/**
 * Entidad User - Representa los usuarios del sistema
 * Cada usuario tiene un rol (USER, EDITOR, ADMIN) y pertenece a un equipo
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({ select: false }) // No incluir password en selects por defecto
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación: Muchos usuarios pertenecen a un equipo (opcional)
  @ManyToOne('Team', 'users', { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: any;

  @Column({ nullable: true })
  teamId: string;

  // Método para validar password
  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  /**
   * Crear nuevo usuario (solo ADMIN)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar que el equipo existe (solo si se proporciona)
    if (createUserDto.teamId) {
      const team = await this.teamsRepository.findOne({
        where: { id: createUserDto.teamId }
      });
      
      if (!team) {
        throw new NotFoundException(`Team with ID ${createUserDto.teamId} not found`);
      }
    }

    // Verificar que el email no esté en uso
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear usuario
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  /**
   * Obtener todos los usuarios (solo ADMIN)
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener usuario por ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['team']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Actualizar usuario (solo ADMIN)
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si se está actualizando el equipo, verificar que existe (solo si no es null)
    if (updateUserDto.teamId !== undefined) {
      if (updateUserDto.teamId) {
        const team = await this.teamsRepository.findOne({
          where: { id: updateUserDto.teamId }
        });
        
        if (!team) {
          throw new NotFoundException(`Team with ID ${updateUserDto.teamId} not found`);
        }
      }
      // Si teamId es null/undefined, se permite (desasignar equipo)
    }

    // Si se está actualizando el email, verificar unicidad
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    await this.usersRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  /**
   * Eliminar usuario (solo ADMIN)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // No permitir eliminar el último admin
    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.usersRepository.count({
        where: { role: UserRole.ADMIN }
      });
      
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the last admin user');
      }
    }

    await this.usersRepository.remove(user);
  }

  /**
   * Obtener usuarios por equipo
   */
  async findByTeam(teamId: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: { teamId },
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener solo editores
   */
  async findEditors(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { role: UserRole.EDITOR },
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener usuarios sin equipo asignado
   */
  async findUsersWithoutTeam(): Promise<User[]> {
    return await this.usersRepository.find({
      where: { teamId: IsNull() },
      order: { createdAt: 'DESC' }
    });
  }
}
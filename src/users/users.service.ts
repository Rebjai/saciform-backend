import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EditorCreateUserDto } from './dto/editor-create-user.dto';
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
   * Método privado para hashear contraseñas
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

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

    // Hashear contraseña manualmente
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Crear usuario con contraseña hasheada
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

    // Si se está actualizando la contraseña, hashearla manualmente
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    // Actualizar las propiedades del usuario
    Object.assign(user, updateUserDto);

    // Guardar usuario
    return await this.usersRepository.save(user);
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

  // ===== MÉTODOS ESPECÍFICOS PARA EDITORES =====

  /**
   * Crear usuario normal por EDITOR
   * Solo puede crear usuarios USER y se asignan automáticamente a su equipo
   */
  async createByEditor(editorCreateUserDto: EditorCreateUserDto, editorId: string): Promise<User> {
    // Buscar el editor para obtener su equipo
    const editor = await this.usersRepository.findOne({
      where: { id: editorId },
      relations: ['team']
    });

    if (!editor) {
      throw new NotFoundException('Editor not found');
    }

    // Validar que el editor tenga un equipo asignado
    if (!editor.teamId) {
      throw new BadRequestException('Editor must have a team assigned to create users');
    }

    // Verificar que el email no esté en uso
    const existingUser = await this.usersRepository.findOne({
      where: { email: editorCreateUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hashear contraseña manualmente
    const hashedPassword = await this.hashPassword(editorCreateUserDto.password);

    // Crear usuario normal con el equipo del editor
    const user = this.usersRepository.create({
      email: editorCreateUserDto.email,
      name: editorCreateUserDto.name,
      password: hashedPassword, // Contraseña ya hasheada
      role: UserRole.USER, // Solo puede crear usuarios normales
      teamId: editor.teamId, // Asignar automáticamente el equipo del editor
    });

    return await this.usersRepository.save(user);
  }
  
  /**
   * Obtener usuarios del equipo del editor (solo para editores)
   */
  async findMyTeamUsers(editorId: string): Promise<User[]> {
    // Buscar el editor para obtener su equipo
    const editor = await this.usersRepository.findOne({
      where: { id: editorId },
      relations: ['team']
    });

    if (!editor) {
      throw new NotFoundException('Editor not found');
    }

    if (!editor.teamId) {
      throw new BadRequestException('Editor must have a team assigned');
    }

    // Obtener todos los usuarios del equipo del editor (excluyendo al editor mismo)
    return await this.usersRepository.find({
      where: { 
        teamId: editor.teamId,
        id: Not(editorId) // Excluir al editor de la lista
      },
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener un usuario específico del equipo del editor
   */
  async findMyTeamUser(editorId: string, userId: string): Promise<User> {
    // Verificar que el editor existe y obtener su equipo
    const editor = await this.usersRepository.findOne({
      where: { id: editorId }
    });

    if (!editor) {
      throw new NotFoundException('Editor not found');
    }

    if (!editor.teamId) {
      throw new BadRequestException('Editor must have a team assigned');
    }

    // Buscar el usuario específico
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['team']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verificar que el usuario pertenece al equipo del editor
    if (user.teamId !== editor.teamId) {
      throw new ForbiddenException('You can only access users from your own team');
    }

    // No permitir que un editor acceda a otro editor o admin
    if (user.role === UserRole.EDITOR || user.role === UserRole.ADMIN) {
      throw new ForbiddenException('You cannot access users with editor or admin roles');
    }

    return user;
  }

  /**
   * Actualizar usuario del equipo del editor
   */
  async updateMyTeamUser(editorId: string, userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar acceso al usuario
    const user = await this.findMyTeamUser(editorId, userId);

    // Restringir qué campos puede actualizar un editor
    const allowedFields: Partial<UpdateUserDto> = {};
    
    // Solo permitir actualizar nombre y email (NO rol, NO teamId, NO password sin validación especial)
    if (updateUserDto.name) allowedFields.name = updateUserDto.name;
    if (updateUserDto.email) allowedFields.email = updateUserDto.email;
    
    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      allowedFields.password = await this.hashPassword(updateUserDto.password);
    }

    // Verificar email único si se está cambiando
    if (allowedFields.email && allowedFields.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: allowedFields.email }
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Actualizar solo los campos permitidos
    Object.assign(user, allowedFields);

    return await this.usersRepository.save(user);
  }

  /**
   * Eliminar usuario del equipo del editor
   */
  async removeMyTeamUser(editorId: string, userId: string): Promise<void> {
    // Verificar acceso al usuario
    const user = await this.findMyTeamUser(editorId, userId);
    
    // Eliminar el usuario
    await this.usersRepository.remove(user);
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AssignTeamDto } from './dto/assign-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear un nuevo equipo
   */
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Verificar que no exista un equipo con el mismo nombre
    const existingTeam = await this.teamRepository.findOne({
      where: { name: createTeamDto.name }
    });

    if (existingTeam) {
      throw new BadRequestException(`Ya existe un equipo con el nombre "${createTeamDto.name}"`);
    }

    const team = this.teamRepository.create(createTeamDto);
    return await this.teamRepository.save(team);
  }

  /**
   * Obtener todos los equipos con información de usuarios
   */
  async findAll(): Promise<Team[]> {
    return await this.teamRepository.find({
      relations: ['users'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener un equipo por ID con información de usuarios
   */
  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!team) {
      throw new NotFoundException(`Equipo con ID "${id}" no encontrado`);
    }

    return team;
  }

  /**
   * Actualizar un equipo
   */
  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro equipo con ese nombre
    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({
        where: { name: updateTeamDto.name }
      });

      if (existingTeam) {
        throw new BadRequestException(`Ya existe un equipo con el nombre "${updateTeamDto.name}"`);
      }
    }

    await this.teamRepository.update(id, updateTeamDto);
    return await this.findOne(id);
  }

  /**
   * Eliminar un equipo
   */
  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);

    // Verificar si el equipo tiene usuarios asignados
    if (team.users && team.users.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el equipo "${team.name}" porque tiene ${team.users.length} usuario(s) asignado(s). Primero debe reasignar o eliminar estos usuarios.`
      );
    }

    await this.teamRepository.remove(team);
  }

  /**
   * Asignar un equipo a un usuario o editor
   */
  async assignTeam(assignTeamDto: AssignTeamDto): Promise<User> {
    const { userId, teamId } = assignTeamDto;

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['team']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    // Verificar que el equipo existe
    const team = await this.findOne(teamId);

    // Asignar el equipo al usuario
    user.team = team;
    return await this.userRepository.save(user);
  }

  /**
   * Remover a un usuario de su equipo actual
   */
  async unassignTeam(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['team']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado`);
    }

    if (!user.team) {
      throw new BadRequestException(`El usuario no tiene un equipo asignado`);
    }

    user.team = null;
    return await this.userRepository.save(user);
  }

  /**
   * Obtener todos los usuarios de un equipo específico
   */
  async getTeamUsers(teamId: string): Promise<User[]> {
    await this.findOne(teamId); // Verificar que el equipo existe

    return await this.userRepository.find({
      where: { team: { id: teamId } },
      relations: ['team'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtener usuarios sin equipo asignado
   */
  async getUsersWithoutTeam(): Promise<User[]> {
    return await this.userRepository.find({
      where: { team: null },
      order: { createdAt: 'DESC' }
    });
  }
}
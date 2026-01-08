import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './entities/response.entity';
import { User } from '../users/entities/user.entity';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ResponseStatus, UserRole } from '../common/enums';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createResponseDto: CreateResponseDto, requestingUserId: string, requestingUserRole: string, includeFull = false) {
    const { 
      surveyId, 
      answers, 
      metadata, 
      userId,
      municipalityId, 
      status 
    } = createResponseDto;

    // Determinar el userId final - usar el proporcionado o el del usuario autenticado
    const finalUserId = userId || requestingUserId;

    // Crear la respuesta
    const response = this.responsesRepository.create({
      surveyId,
      answers,
      metadata,
      userId: finalUserId,
      municipalityId,
      status: status || ResponseStatus.DRAFT,
      lastModifiedBy: requestingUserId,
    });

    const savedResponse = await this.responsesRepository.save(response);

    // Retornar respuesta completa o resumida según se requiera
    if (includeFull) {
      return this.findOne(savedResponse.id);
    }

    // Retornar información básica de confirmación
    return {
      id: savedResponse.id,
      surveyId: savedResponse.surveyId,
      status: savedResponse.status,
      answersCount: answers ? Object.keys(answers).length : 0,
      createdAt: savedResponse.createdAt,
      message: 'Respuesta creada exitosamente'
    };
  }

  /**
   * Verificar si un usuario puede gestionar una respuesta específica
   * - USER: Solo sus propias respuestas
   * - EDITOR: Solo respuestas de usuarios de su equipo (incluyendo las suyas)
   * - ADMIN: Todas las respuestas
   */
  private async canManageResponse(responseUserId: string, managingUserId: string, managingUserRole: string): Promise<boolean> {
    // Admin puede gestionar todas las respuestas
    if (managingUserRole === UserRole.ADMIN) {
      return true;
    }

    // Usuario puede gestionar solo sus propias respuestas
    if (managingUserRole === UserRole.USER) {
      return responseUserId === managingUserId;
    }

    // Editor puede gestionar respuestas de usuarios de su equipo
    if (managingUserRole === UserRole.EDITOR) {
      // Si es la respuesta del mismo editor, puede gestionarla
      if (responseUserId === managingUserId) {
        return true;
      }

      // Verificar si ambos usuarios pertenecen al mismo equipo
      const [responseUser, managingUser] = await Promise.all([
        this.usersRepository.findOne({ where: { id: responseUserId } }),
        this.usersRepository.findOne({ where: { id: managingUserId } })
      ]);

      if (!responseUser || !managingUser) {
        return false;
      }

      // El editor debe tener equipo asignado y el usuario de la respuesta debe estar en el mismo equipo
      return managingUser.teamId !== null && 
             responseUser.teamId !== null && 
             managingUser.teamId === responseUser.teamId;
    }

    return false;
  }

  async update(id: string, updateResponseDto: UpdateResponseDto, userId: string, userRole?: string) {
    const response = await this.findOne(id);

    // Verificar permisos usando el método helper
    const canManage = await this.canManageResponse(response.userId, userId, userRole || UserRole.USER);
    if (!canManage) {
      throw new ForbiddenException('No tienes permisos para modificar esta respuesta');
    }

    // Solo USER no puede modificar respuestas finalizadas
    // ADMIN y EDITOR sí pueden modificar respuestas finalizadas
    const isAdmin = userRole === UserRole.ADMIN;
    const isEditor = userRole === UserRole.EDITOR;

    // Verificar si está intentando finalizar la respuesta
    const isFinalizingResponse = updateResponseDto.status === ResponseStatus.FINAL;
    
    if (isFinalizingResponse && response.status === ResponseStatus.FINAL) {
      throw new BadRequestException('La respuesta ya está finalizada');
    }

    // Verificar si está modificando contenido de respuesta finalizada
    const isModifyingContent = updateResponseDto.answers || updateResponseDto.metadata;
    if (response.status === ResponseStatus.FINAL && isModifyingContent && !isAdmin && !isEditor) {
      throw new BadRequestException('No puedes modificar el contenido de una respuesta finalizada. Solo editores y administradores pueden hacerlo.');
    }

    const { answers, metadata, status } = updateResponseDto;

    // Preparar datos para actualizar
    const updateData: any = {};
    
    if (answers) {
      // Merge de las respuestas existentes con las nuevas
      updateData.answers = { ...response.answers, ...answers };
    }
    
    if (metadata) {
      // Merge de metadata existente con nuevo
      updateData.metadata = { ...response.metadata, ...metadata };
    }

    if (status) {
      // Actualizar el estado si se proporciona
      updateData.status = status;
    }

    // Registrar quién modificó la respuesta
    updateData.lastModifiedBy = userId;

    // Actualizar la respuesta
    await this.responsesRepository.update(id, updateData);

    // Obtener la respuesta actualizada
    const updatedResponse = await this.responsesRepository.findOne({
      where: { id }
    });

    if (!updatedResponse) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return {
      id: updatedResponse.id,
      surveyId: updatedResponse.surveyId,
      status: updatedResponse.status,
      answersCount: updatedResponse.answers ? Object.keys(updatedResponse.answers).length : 0,
      updatedAt: updatedResponse.updatedAt,
      message: isFinalizingResponse ? 'Respuesta finalizada exitosamente' : 'Respuesta actualizada exitosamente'
    };
  }

  async findAll(userId?: string, surveyId?: string, status?: ResponseStatus) {
    const queryBuilder = this.responsesRepository
      .createQueryBuilder('response')
      .orderBy('response.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('response.userId = :userId', { userId });
    }

    if (surveyId) {
      queryBuilder.andWhere('response.surveyId = :surveyId', { surveyId });
    }

    if (status) {
      queryBuilder.andWhere('response.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const response = await this.responsesRepository.findOne({
      where: { id }
    });

    if (!response) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return response;
  }

  /**
   * Reabrir una respuesta finalizada (administradores y editores de equipo)
   * Cambia el estado de FINAL a DRAFT
   */
  async reopenResponse(id: string, userId: string, userRole: string): Promise<Response> {
    const response = await this.findOne(id);

    // Verificar permisos: Solo ADMIN y EDITOR con permisos sobre la respuesta
    const canManage = await this.canManageResponse(response.userId, userId, userRole);
    if (!canManage || userRole === UserRole.USER) {
      throw new ForbiddenException('Solo administradores y editores pueden reabrir respuestas de su ámbito');
    }

    if (response.status !== ResponseStatus.FINAL) {
      throw new BadRequestException('Solo se pueden reabrir respuestas finalizadas');
    }

    await this.responsesRepository.update(id, {
      status: ResponseStatus.DRAFT,
    });

    return this.findOne(id);
  }

  async delete(id: string, userId: string, userRole?: string) {
    const response = await this.findOne(id);

    // Verificar permisos usando el método helper
    const canManage = await this.canManageResponse(response.userId, userId, userRole || UserRole.USER);
    if (!canManage) {
      throw new ForbiddenException('No tienes permisos para eliminar esta respuesta');
    }

    // Solo USER no puede eliminar respuestas finalizadas
    // ADMIN y EDITOR sí pueden eliminar respuestas finalizadas
    const isAdmin = userRole === UserRole.ADMIN;
    const isEditor = userRole === UserRole.EDITOR;
    if (response.status === ResponseStatus.FINAL && !isAdmin && !isEditor) {
      throw new BadRequestException('No puedes eliminar una respuesta finalizada. Solo editores y administradores pueden hacerlo.');
    }

    await this.responsesRepository.delete(id);
    return { 
      message: 'Respuesta eliminada correctamente',
      deletedId: id,
      deletedBy: userId,
      userRole: userRole
    };
  }
}
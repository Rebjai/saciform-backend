import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './entities/response.entity';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ResponseStatus, UserRole } from '../common/enums';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
  ) {}

  async create(createResponseDto: CreateResponseDto, userId: string, includeFull = false) {
    const { responseId, surveyId, answers, metadata, version } = createResponseDto;

    // Crear la respuesta con el ID proporcionado o generar uno automático
    const response = this.responsesRepository.create({
      id: responseId, // Si se envía responseId, se usa; sino TypeORM genera uno
      surveyId,
      answers,
      metadata,
      userId,
      status: ResponseStatus.DRAFT,
      version: version || 1, // Versión inicial si no se especifica
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

  async update(id: string, updateResponseDto: UpdateResponseDto, userId: string, userRole?: string) {
    const response = await this.findOne(id);

    // Verificar permisos según el rol
    const isAdmin = userRole === UserRole.ADMIN;
    const isEditor = userRole === UserRole.EDITOR;
    const isOwner = response.userId === userId;

    if (!isOwner && !isAdmin && !isEditor) {
      throw new ForbiddenException('No tienes permisos para modificar esta respuesta');
    }

    // Solo USER no puede modificar respuestas finalizadas
    // ADMIN y EDITOR sí pueden modificar respuestas finalizadas
    if (response.status === ResponseStatus.FINAL && !isAdmin && !isEditor) {
      throw new BadRequestException('No puedes modificar una respuesta finalizada. Solo editores y administradores pueden hacerlo.');
    }

    const { answers, metadata, version } = updateResponseDto;

    // Verificar conflicto de versión si se especifica
    if (version !== undefined && version !== response.version) {
      throw new ConflictException(`Version conflict: expected ${response.version}, received ${version}`);
    }

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

    // Incrementar versión automáticamente en cada update
    updateData.version = response.version + 1;

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
      message: 'Respuesta actualizada exitosamente'
    };
  }

  async findAll(userId?: string, surveyId?: string, status?: ResponseStatus) {
    const queryBuilder = this.responsesRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
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
      where: { id },
      relations: ['user'],
    });

    if (!response) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return response;
  }

  async finalize(id: string, userId: string) {
    const response = await this.findOne(id);

    if (response.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para finalizar esta respuesta');
    }

    if (response.status === ResponseStatus.FINAL) {
      throw new BadRequestException('La respuesta ya está finalizada');
    }

    await this.responsesRepository.update(id, {
      status: ResponseStatus.FINAL,
      finalizedAt: new Date(),
    });

    return this.findOne(id);
  }

  async delete(id: string, userId: string, userRole?: string) {
    const response = await this.findOne(id);

    // Verificar permisos según el rol
    const isAdmin = userRole === UserRole.ADMIN;
    const isEditor = userRole === UserRole.EDITOR;
    const isOwner = response.userId === userId;

    if (!isOwner && !isAdmin && !isEditor) {
      throw new ForbiddenException('No tienes permisos para eliminar esta respuesta');
    }

    // Solo USER no puede eliminar respuestas finalizadas
    // ADMIN y EDITOR sí pueden eliminar respuestas finalizadas
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
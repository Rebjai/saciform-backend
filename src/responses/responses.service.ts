import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './entities/response.entity';
import { ResponseValue } from './entities/response-value.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';
import { Question } from '../questionnaires/entities/question.entity';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { ResponseStatus, UserRole } from '../common/enums';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(Response)
    private responsesRepository: Repository<Response>,
    @InjectRepository(ResponseValue)
    private responseValuesRepository: Repository<ResponseValue>,
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async create(createResponseDto: CreateResponseDto, userId: string, includeFull = false) {
    const { questionnaireId, answers, ...responseData } = createResponseDto;

    // 1. Verificar que el cuestionario existe y está activo
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: questionnaireId, isActive: true },
      relations: ['questions'],
    });

    if (!questionnaire) {
      throw new NotFoundException('Cuestionario no encontrado o inactivo');
    }

    // 2. Crear la respuesta principal
    const response = this.responsesRepository.create({
      ...responseData,
      questionnaireId,
      userId,
      status: ResponseStatus.DRAFT,
    });

    const savedResponse = await this.responsesRepository.save(response);

    // 3. Crear valores de respuesta si se proporcionan
    if (answers && Object.keys(answers).length > 0) {
      await this.saveResponseAnswers(savedResponse.id, answers, questionnaire.questions);
    }

    // Retornar respuesta completa o resumida según se requiera
    if (includeFull) {
      return this.findOne(savedResponse.id);
    }

    // Retornar información básica de confirmación
    return {
      id: savedResponse.id,
      status: savedResponse.status,
      questionnaireId: savedResponse.questionnaireId,
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

    const { answers, ...responseData } = updateResponseDto;

    // Actualizar datos de la respuesta
    await this.responsesRepository.update(id, responseData);

    // Actualizar valores si se proporcionan
    if (answers && Object.keys(answers).length > 0) {
      // Eliminar valores existentes
      await this.responseValuesRepository.delete({ responseId: id });
      
      // Obtener preguntas del cuestionario
      const questionnaire = await this.questionnairesRepository.findOne({
        where: { id: response.questionnaireId },
        relations: ['questions'],
      });

      if (questionnaire) {
        // Crear nuevos valores
        await this.saveResponseAnswers(id, answers, questionnaire.questions);
      }
    }

    // Retornar información básica de confirmación
    const updatedResponse = await this.responsesRepository.findOne({
      where: { id }
    });

    if (!updatedResponse) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return {
      id: updatedResponse.id,
      status: updatedResponse.status,
      questionnaireId: updatedResponse.questionnaireId,
      answersCount: answers ? Object.keys(answers).length : 0,
      updatedAt: updatedResponse.updatedAt,
      message: 'Respuesta actualizada exitosamente'
    };
  }

  async findAll(userId?: string, questionnaireId?: string, status?: ResponseStatus) {
    const queryBuilder = this.responsesRepository
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.questionnaire', 'questionnaire')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.values', 'values')
      .leftJoinAndSelect('values.question', 'question')
      .orderBy('response.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('response.userId = :userId', { userId });
    }

    if (questionnaireId) {
      queryBuilder.andWhere('response.questionnaireId = :questionnaireId', { questionnaireId });
    }

    if (status) {
      queryBuilder.andWhere('response.status = :status', { status });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const response = await this.responsesRepository.findOne({
      where: { id },
      relations: ['questionnaire', 'user', 'values', 'values.question'],
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

  private async saveResponseAnswers(responseId: string, answers: Record<string, any>, questions: Question[]) {
    for (const [questionId, answer] of Object.entries(answers)) {
      // Verificar que la pregunta existe en el cuestionario
      const question = questions.find(q => q.id === questionId);
      if (!question) {
        throw new BadRequestException(`Pregunta ${questionId} no encontrada en el cuestionario`);
      }

      // Determinar el tipo de valor según la respuesta
      const responseValue: any = {
        questionId,
        responseId,
        textValue: null,
        selectedOptions: null,
        imageUrls: null,
        gpsLatitude: null,
        gpsLongitude: null,
        gpsAccuracy: null,
      };

      // Mapear la respuesta según el tipo
      if (typeof answer === 'string') {
        responseValue.textValue = answer;
      } else if (Array.isArray(answer)) {
        // Podría ser opciones seleccionadas o URLs de imágenes
        if (answer.every(item => typeof item === 'string' && item.startsWith('http'))) {
          responseValue.imageUrls = answer; // URLs de imágenes
        } else {
          responseValue.selectedOptions = answer; // Opciones seleccionadas
        }
      } else if (typeof answer === 'object' && answer.latitude && answer.longitude) {
        // Coordenadas GPS
        responseValue.gpsLatitude = answer.latitude;
        responseValue.gpsLongitude = answer.longitude;
        responseValue.gpsAccuracy = answer.accuracy || null;
      }

      const entity = this.responseValuesRepository.create(responseValue);
      await this.responseValuesRepository.save(entity);
    }
  }
}
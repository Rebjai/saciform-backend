import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto, userId: string) {
    const { questions, ...questionnaireData } = createQuestionnaireDto;

    // 1. Crear el cuestionario
    const questionnaire = this.questionnairesRepository.create({
      ...questionnaireData,
      createdById: userId,
    });

    const savedQuestionnaire = await this.questionnairesRepository.save(questionnaire);

    // 2. Crear las preguntas si existen
    if (questions && questions.length > 0) {
      const questionEntities = questions.map((questionDto, index) => {
        return this.questionsRepository.create({
          ...questionDto,
          order: index + 1, // Asignar orden secuencial
          questionnaireId: savedQuestionnaire.id,
        });
      });

      await this.questionsRepository.save(questionEntities);
    }

    // 3. Retornar el cuestionario con sus preguntas (formato limpio)
    return this.findOneFormatted(savedQuestionnaire.id);
  }

  async findAll() {
    const questionnaires = await this.questionnairesRepository.find({
      where: { isActive: true },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });

    return questionnaires.map(questionnaire => this.formatQuestionnaire(questionnaire));
  }

  async findOne(id: string) {
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id, isActive: true },
      relations: ['questions'],
    });

    if (!questionnaire) {
      throw new NotFoundException('Cuestionario no encontrado');
    }

    return questionnaire;
  }

  async findOneFormatted(id: string) {
    const questionnaire = await this.findOne(id);
    return this.formatQuestionnaire(questionnaire);
  }

  private formatQuestionnaire(questionnaire: any) {
    return {
      id: questionnaire.id,
      title: questionnaire.title,
      description: questionnaire.description,
      questions: questionnaire.questions
        .sort((a, b) => a.order - b.order)
        .map(question => ({
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options,
          isRequired: question.isRequired,
          order: question.order,
        })),
    };
  }
}
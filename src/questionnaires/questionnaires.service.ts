import { Injectable } from '@nestjs/common';
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

    // 3. Retornar el cuestionario con sus preguntas
    return this.findOne(savedQuestionnaire.id);
  }

  async findAll() {
    return this.questionnairesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.questionnairesRepository.findOne({
      where: { id, isActive: true },
      relations: ['questions'],
    });
  }
}
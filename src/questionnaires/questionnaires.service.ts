import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnairesRepository: Repository<Questionnaire>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto, userId: string) {
    const questionnaire = this.questionnairesRepository.create({
      ...createQuestionnaireDto,
      createdById: userId,
    });

    return this.questionnairesRepository.save(questionnaire);
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
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { Response } from './entities/response.entity';
import { ResponseValue } from './entities/response-value.entity';
import { Questionnaire } from '../questionnaires/entities/questionnaire.entity';
import { Question } from '../questionnaires/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Response, ResponseValue, Questionnaire, Question])
  ],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
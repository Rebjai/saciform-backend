import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('questionnaires')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  create(@Body() createQuestionnaireDto: CreateQuestionnaireDto, @Request() req) {
    return this.questionnairesService.create(createQuestionnaireDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findAll() {
    return this.questionnairesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.questionnairesService.findOneFormatted(id);
  }
}
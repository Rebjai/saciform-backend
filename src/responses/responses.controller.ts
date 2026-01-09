import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ResponseStatus } from '../common/enums';

@Controller('responses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  create(
    @Body() createResponseDto: CreateResponseDto, 
    @Request() req,
    @Query('include') include?: string
  ) {
    return this.responsesService.create(
      createResponseDto, 
      req.user.id, 
      req.user.role,
      include === 'full'
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findAll(
    @Request() req,
    @Query('surveyId') surveyId?: string,
    @Query('status') status?: ResponseStatus,
  ) {
    // Pasar userId y role para que el servicio determine el filtrado apropiado
    return this.responsesService.findAll(req.user.id, req.user.role, surveyId, status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() updateResponseDto: UpdateResponseDto,
    @Request() req,
  ) {
    return this.responsesService.update(id, updateResponseDto, req.user.id, req.user.role);
  }

  @Patch(':id/reopen')
  @Roles(UserRole.ADMIN, UserRole.EDITOR) // Administradores y editores pueden reabrir respuestas
  reopen(@Param('id') id: string, @Request() req) {
    return this.responsesService.reopenResponse(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  remove(@Param('id') id: string, @Request() req) {
    return this.responsesService.delete(id, req.user.id, req.user.role);
  }
}
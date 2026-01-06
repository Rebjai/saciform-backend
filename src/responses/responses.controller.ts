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
    // Los usuarios normales solo ven sus propias respuestas
    // Los ADMIN y EDITOR pueden ver todas las respuestas
    const userId = req.user.role === UserRole.USER ? req.user.id : undefined;
    
    return this.responsesService.findAll(userId, surveyId, status);
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

  @Patch(':id/finalize')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  finalize(@Param('id') id: string, @Request() req) {
    return this.responsesService.finalize(id, req.user.id);
  }

  @Patch(':id/reopen')
  @Roles(UserRole.ADMIN) // Solo administradores pueden reabrir respuestas
  reopen(@Param('id') id: string, @Request() req) {
    return this.responsesService.reopenResponse(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  remove(@Param('id') id: string, @Request() req) {
    return this.responsesService.delete(id, req.user.id, req.user.role);
  }
}
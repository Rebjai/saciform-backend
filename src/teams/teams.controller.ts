import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AssignTeamDto } from './dto/assign-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Solo administradores pueden gestionar equipos
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @Get()
  async findAll() {
    return await this.teamsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.teamsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return await this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.teamsService.remove(id);
  }

  @Post('assign')
  async assignTeam(@Body() assignTeamDto: AssignTeamDto) {
    return await this.teamsService.assignTeam(assignTeamDto);
  }

  @Delete('unassign/:userId')
  async unassignTeam(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.teamsService.unassignTeam(userId);
  }

  @Get(':id/users')
  async getTeamUsers(@Param('id', ParseUUIDPipe) id: string) {
    return await this.teamsService.getTeamUsers(id);
  }

  @Get('users/without-team')
  async getUsersWithoutTeam() {
    return await this.teamsService.getUsersWithoutTeam();
  }
}
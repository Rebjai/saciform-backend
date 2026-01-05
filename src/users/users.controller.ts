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
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EditorCreateUserDto } from './dto/editor-create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear nuevo usuario (solo ADMIN)
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // No devolver la contraseña en la respuesta
    const { password, ...result } = user;
    return {
      message: 'User created successfully',
      user: result
    };
  }

  /**
   * Obtener todos los usuarios (solo ADMIN)
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    // No devolver contraseñas
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return {
      message: 'Users retrieved successfully',
      users: usersWithoutPasswords,
      count: users.length
    };
  }

  /**
   * Obtener editores (solo ADMIN)
   */
  @Get('editors')
  @Roles(UserRole.ADMIN)
  async findEditors() {
    const editors = await this.usersService.findEditors();
    const editorsWithoutPasswords = editors.map(({ password, ...editor }) => editor);
    return {
      message: 'Editors retrieved successfully',
      editors: editorsWithoutPasswords,
      count: editors.length
    };
  }

  /**
   * Obtener usuarios sin equipo asignado (solo ADMIN)
   */
  @Get('without-team')
  @Roles(UserRole.ADMIN)
  async findUsersWithoutTeam() {
    const users = await this.usersService.findUsersWithoutTeam();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return {
      message: 'Users without team retrieved successfully',
      users: usersWithoutPasswords,
      count: users.length
    };
  }

  /**
   * Obtener usuarios por equipo (solo ADMIN)
   */
  @Get('team/:teamId')
  @Roles(UserRole.ADMIN)
  async findByTeam(@Param('teamId') teamId: string) {
    const users = await this.usersService.findByTeam(teamId);
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return {
      message: 'Team users retrieved successfully',
      users: usersWithoutPasswords,
      count: users.length
    };
  }

  /**
   * Obtener usuario por ID (solo ADMIN)
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    const { password, ...result } = user;
    return {
      message: 'User retrieved successfully',
      user: result
    };
  }

  /**
   * Actualizar usuario (solo ADMIN)
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password, ...result } = user;
    return {
      message: 'User updated successfully',
      user: result
    };
  }

  /**
   * Eliminar usuario (solo ADMIN)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully'
    };
  }

  // ===== ENDPOINTS ESPECÍFICOS PARA EDITORES =====

  /**
   * Crear usuario normal por EDITOR
   * Solo puede crear usuarios USER y se asignan automáticamente al equipo del editor
   */
  @Post('create-team-user')
  @Roles(UserRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  async createByEditor(@Body() editorCreateUserDto: EditorCreateUserDto, @Request() req) {
    const user = await this.usersService.createByEditor(editorCreateUserDto, req.user.sub);
    // No devolver la contraseña en la respuesta
    const { password, ...result } = user;
    return {
      message: 'User created successfully and assigned to your team',
      user: result
    };
  }
  
  /**
   * Obtener usuarios de mi equipo (solo EDITOR)
   */
  @Get('my-team')
  @Roles(UserRole.EDITOR)
  async findMyTeamUsers(@Request() req) {
    const users = await this.usersService.findMyTeamUsers(req.user.sub);
    // No devolver contraseñas
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return {
      message: 'Team users retrieved successfully',
      users: usersWithoutPasswords,
      count: users.length
    };
  }

  /**
   * Obtener usuario específico de mi equipo (solo EDITOR)
   */
  @Get('my-team/:id')
  @Roles(UserRole.EDITOR)
  async findMyTeamUser(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findMyTeamUser(req.user.sub, id);
    const { password, ...result } = user;
    return {
      message: 'Team user retrieved successfully',
      user: result
    };
  }

  /**
   * Actualizar usuario de mi equipo (solo EDITOR)
   */
  @Patch('my-team/:id')
  @Roles(UserRole.EDITOR)
  async updateMyTeamUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const user = await this.usersService.updateMyTeamUser(req.user.sub, id, updateUserDto);
    const { password, ...result } = user;
    return {
      message: 'Team user updated successfully',
      user: result
    };
  }

  /**
   * Eliminar usuario de mi equipo (solo EDITOR)
   */
  @Delete('my-team/:id')
  @Roles(UserRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMyTeamUser(@Param('id') id: string, @Request() req) {
    await this.usersService.removeMyTeamUser(req.user.sub, id);
    return {
      message: 'Team user deleted successfully'
    };
  }
}
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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MunicipalitiesService } from './municipalities.service';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('municipalities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MunicipalitiesController {
  constructor(private readonly municipalitiesService: MunicipalitiesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  create(@Body() createMunicipalityDto: CreateMunicipalityDto) {
    return this.municipalitiesService.create(createMunicipalityDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findAll(
    @Query('district') district?: string, 
    @Query('name') name?: string, 
    @Query('code') code?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    // Solo ADMIN puede ver municipios inactivos
    if (includeInactive === 'true') {
      return this.municipalitiesService.findAllIncludingInactive();
    }

    // Si hay filtros específicos
    if (code) {
      return this.municipalitiesService.findByCode(code);
    }
    
    if (name) {
      return this.municipalitiesService.findByName(name);
    }
    
    if (district) {
      return this.municipalitiesService.findByDistrict(district);
    }
    
    // Retornar todos los municipios activos ordenados por nombre
    return this.municipalitiesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.municipalitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  update(@Param('id') id: string, @Body() updateMunicipalityDto: UpdateMunicipalityDto) {
    return this.municipalitiesService.update(id, updateMunicipalityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.municipalitiesService.remove(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  restore(@Param('id') id: string) {
    return this.municipalitiesService.restore(id);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipality } from './entities/municipality.entity';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';

@Injectable()
export class MunicipalitiesService {
  constructor(
    @InjectRepository(Municipality)
    private municipalitiesRepository: Repository<Municipality>,
  ) {}

  async create(createMunicipalityDto: CreateMunicipalityDto): Promise<Municipality> {
    const municipality = this.municipalitiesRepository.create(createMunicipalityDto);
    return this.municipalitiesRepository.save(municipality);
  }

  async findAll(): Promise<Municipality[]> {
    return this.municipalitiesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Municipality> {
    const municipality = await this.municipalitiesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!municipality) {
      throw new NotFoundException('Municipio no encontrado');
    }

    return municipality;
  }

  async update(id: string, updateMunicipalityDto: UpdateMunicipalityDto): Promise<Municipality> {
    await this.municipalitiesRepository.update(id, updateMunicipalityDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const municipality = await this.findOne(id);
    
    // Borrado lógico: cambiar isActive a false
    await this.municipalitiesRepository.update(id, { isActive: false });
  }

  // Método útil para buscar por código
  async findByCode(code: string): Promise<Municipality> {
    const municipality = await this.municipalitiesRepository.findOne({
      where: { code, isActive: true },
    });

    if (!municipality) {
      throw new NotFoundException('Municipio no encontrado');
    }

    return municipality;
  }

  // Método útil para buscar por nombre
  async findByName(name: string): Promise<Municipality[]> {
    return this.municipalitiesRepository.find({
      where: { name, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Método útil para buscar por distrito
  async findByDistrict(district: string): Promise<Municipality[]> {
    return this.municipalitiesRepository.find({
      where: { district, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Métodos para administradores
  async findAllIncludingInactive(): Promise<Municipality[]> {
    return this.municipalitiesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async restore(id: string): Promise<Municipality> {
    // Buscar municipio sin filtro de isActive
    const municipality = await this.municipalitiesRepository.findOne({
      where: { id },
    });

    if (!municipality) {
      throw new NotFoundException('Municipio no encontrado');
    }

    // Reactivar municipio
    await this.municipalitiesRepository.update(id, { isActive: true });
    return this.findOne(id);
  }
}
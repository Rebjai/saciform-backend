import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import { UserRole } from '../../common/enums';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async seed() {
    console.log('🌱 Iniciando seed de base de datos...');

    // 1. Crear equipo por defecto
    const existingTeam = await this.teamsRepository.findOne({
      where: { name: 'Administración' },
    });

    let adminTeam;
    if (!existingTeam) {
      adminTeam = this.teamsRepository.create({
        name: 'Administración',
        description: 'Equipo de administradores del sistema',
        isActive: true,
      });
      adminTeam = await this.teamsRepository.save(adminTeam);
      console.log('✅ Equipo "Administración" creado');
    } else {
      adminTeam = existingTeam;
      console.log('ℹ️ Equipo "Administración" ya existe');
    }

    // 2. Crear usuario admin
    const existingAdmin = await this.usersRepository.findOne({
      where: { email: 'admin@sacifor.com' },
    });

    if (!existingAdmin) {
      const adminUser = this.usersRepository.create({
        email: 'admin@sacifor.com',
        name: 'Administrador',
        password: 'admin123', // Texto plano - el hook @BeforeInsert() se encarga del hash
        role: UserRole.ADMIN,
        teamId: adminTeam.id,
      });

      await this.usersRepository.save(adminUser);
      console.log('✅ Usuario admin creado:');
      console.log('   📧 Email: admin@sacifor.com');
      console.log('   🔑 Password: admin123');
      console.log('   👤 Rol: ADMIN');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    // 3. Crear equipo de campo por defecto
    const existingFieldTeam = await this.teamsRepository.findOne({
      where: { name: 'Equipo de Campo' },
    });

    let fieldTeam;
    if (!existingFieldTeam) {
      fieldTeam = this.teamsRepository.create({
        name: 'Equipo de Campo',
        description: 'Equipo para trabajo de campo',
        isActive: true,
      });
      fieldTeam = await this.teamsRepository.save(fieldTeam);
      console.log('✅ Equipo "Equipo de Campo" creado');
    } else {
      fieldTeam = existingFieldTeam;
      console.log('ℹ️ Equipo "Equipo de Campo" ya existe');
    }

    // 4. Crear usuario editor de prueba
    const existingEditor = await this.usersRepository.findOne({
      where: { email: 'editor@sacifor.com' },
    });

    if (!existingEditor) {
      const editorUser = this.usersRepository.create({
        email: 'editor@sacifor.com',
        name: 'Editor de Prueba',
        password: 'editor123', // Texto plano - el hook @BeforeInsert() se encarga del hash
        role: UserRole.EDITOR,
        teamId: fieldTeam.id,
      });

      await this.usersRepository.save(editorUser);
      console.log('✅ Usuario editor creado:');
      console.log('   📧 Email: editor@sacifor.com');
      console.log('   🔑 Password: editor123');
      console.log('   👤 Rol: EDITOR');
    } else {
      console.log('ℹ️ Usuario editor ya existe');
    }

    // 5. Crear usuario normal de prueba
    const existingUser = await this.usersRepository.findOne({
      where: { email: 'user@sacifor.com' },
    });

    if (!existingUser) {
      const normalUser = this.usersRepository.create({
        email: 'user@sacifor.com',
        name: 'Usuario de Prueba',
        password: 'user123', // Texto plano - el hook @BeforeInsert() se encarga del hash
        role: UserRole.USER,
        teamId: fieldTeam.id,
      });

      await this.usersRepository.save(normalUser);
      console.log('✅ Usuario normal creado:');
      console.log('   📧 Email: user@sacifor.com');
      console.log('   🔑 Password: user123');
      console.log('   👤 Rol: USER');
    } else {
      console.log('ℹ️ Usuario normal ya existe');
    }

    console.log('🎉 Seed completado exitosamente!');
    console.log('\n📝 Usuarios disponibles para pruebas:');
    console.log('   ADMIN: admin@sacifor.com / admin123');
    console.log('   EDITOR: editor@sacifor.com / editor123');  
    console.log('   USER: user@sacifor.com / user123');
  }
}
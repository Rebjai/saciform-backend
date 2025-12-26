import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeeder } from './seeds/database.seeder';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  providers: [DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class DatabaseModule {}
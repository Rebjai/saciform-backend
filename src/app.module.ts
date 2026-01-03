import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { ResponsesModule } from './responses/responses.module';
import { DatabaseModule } from './database/database.module';
import { FilesModule } from './files/files.module';
import { MunicipalitiesModule } from './municipalities/municipalities.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    QuestionnairesModule,
    ResponsesModule,
    DatabaseModule,
    FilesModule,
    MunicipalitiesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

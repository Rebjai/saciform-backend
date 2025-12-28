import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [
    __dirname + '/../users/entities/*.entity{.ts,.js}',
    __dirname + '/../teams/entities/*.entity{.ts,.js}',
    __dirname + '/../questionnaires/entities/*.entity{.ts,.js}',
    __dirname + '/../responses/entities/*.entity{.ts,.js}',
    __dirname + '/../files/entities/*.entity{.ts,.js}',
  ],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  charset: 'utf8mb4',
  timezone: 'Z',
  extra: {
    connectionLimit: 10,
  },
});
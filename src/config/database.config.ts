import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    
    // Auto-discovery de entidades
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // Configuración de migraciones
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
    migrationsTransactionMode: 'all',
    migrationsRun: isProduction,
    
    // Configuración básica
    synchronize: false,
    logging: !isProduction,
    charset: 'utf8mb4',
    timezone: 'Z',
    
    extra: {
      connectionLimit: isProduction ? 20 : 10,
    },
  };
};
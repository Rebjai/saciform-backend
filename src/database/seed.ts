import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseSeeder } from './seeds/database.seeder';

async function runSeed() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(DatabaseSeeder);
    
    await seeder.seed();
    
    await app.close();
    console.log('✅ Aplicación cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  }
}

runSeed();
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const isDevelopment = config.get('NODE_ENV') !== 'production';

    // Railway üçün DATABASE_URL istifadə edin
    const databaseUrl = config.get('DATABASE_URL');

    if (databaseUrl) {
      // Railway və ya production environment
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true, // Production-da false olmalıdır!
        ssl: !isDevelopment ? { rejectUnauthorized: false } : false,
        retryAttempts: 10,
        retryDelay: 3000,
      };
    } else {
      // Local development
      return {
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
      };
    }
  },
};

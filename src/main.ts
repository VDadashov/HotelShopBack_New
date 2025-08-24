import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // API prefix əlavə edilir
  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/uploads/',
  });

  // CORS konfiqurasiyası
  // CORS konfiqurasiyası
  app.enableCors({
    origin: [
      'https://lighthearted-semifreddo-f48916.netlify.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://gstone-admin.netlify.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'Origin',
      'X-Requested-With',    ],
    credentials: true,
  });

  // Global validation pipe - YENİLƏNMİŞ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        enableCircularCheck: true,
        excludeExtraneousValues: false, // Bu da vacibdir
      },
    }),
  );

  // Swagger konfiqurasiyası
  const config = new DocumentBuilder()
    .setTitle('GStone API')
    .setDescription('GStone Backend Swagger API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

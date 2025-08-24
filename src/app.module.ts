import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { typeOrmConfig } from './config/typeorm.config';
import { I18nModule } from './i18n/i18n.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PageModule } from './page/page.module';
import { SectionModule } from './section/section.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule,
    UploadModule,
    AuthModule,
    CategoryModule,
    UploadModule,
    PageModule,
    SectionModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

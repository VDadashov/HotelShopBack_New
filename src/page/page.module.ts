// page.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from '../_common/entities/page.entity'; // ← Bu import lazımdır
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { I18nModule } from '../i18n/i18n.module'; // I18nService üçün

@Module({
  imports: [
    TypeOrmModule.forFeature([Page]), // ← Bu sətr əlavə olunmalıdır
    I18nModule, // I18nService-i import etmək üçün
  ],
  controllers: [PageController],
  providers: [PageService],
})
export class PageModule {}

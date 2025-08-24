import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { Section } from '../_common/entities/section.entity';
import { Page } from '../_common/entities/page.entity';
import { I18nModule } from '../i18n/i18n.module'; // I18n module import

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Section, // Section repository
      Page, // Page repository
    ]),
    I18nModule, // I18nService bu module-dən gəlir
  ],
  controllers: [SectionController],
  providers: [SectionService], // Yalnız SectionService
  exports: [SectionService],
})
export class SectionModule {}

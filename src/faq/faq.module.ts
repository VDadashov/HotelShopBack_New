import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { Faq } from '../_common/entities/faq.entity';
import { I18nModule } from 'src/i18n/i18n.module';

@Module({
  imports: [TypeOrmModule.forFeature([Faq]), I18nModule],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}

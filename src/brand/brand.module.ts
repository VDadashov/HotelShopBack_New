import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { I18nModule } from 'src/i18n/i18n.module';
import { Brand } from 'src/_common/entities/brand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), I18nModule],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}

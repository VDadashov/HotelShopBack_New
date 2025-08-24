import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../_common/entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { I18nModule } from '../i18n/i18n.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), I18nModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {} 
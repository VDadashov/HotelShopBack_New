import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../_common/entities/product.entity';
import { Category } from '../_common/entities/category.entity';
import { I18nModule } from '../i18n/i18n.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { fileNameEdit } from '../_common/utils/file-name-edit.util';
import { imageFileFilter } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    I18nModule, // I18nModule əlavə edin
    MulterModule.register({
      storage: diskStorage({
        destination: './public/uploads/images',
        filename: fileNameEdit,
      }),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

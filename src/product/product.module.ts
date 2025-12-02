import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../_common/entities/product.entity';
import { Category } from '../_common/entities/category.entity';
import { I18nModule } from '../i18n/i18n.module';
import { UploadModule } from '../upload/upload.module';
import { memoryStorage } from 'multer';
import { imageFileFilter, imageMaxSize } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    I18nModule,
    UploadModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: imageMaxSize,
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

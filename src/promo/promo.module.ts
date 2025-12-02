import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PromoService } from './promo.service';
import { PromoController } from './promo.controller';
import { Promo } from '../_common/entities/promo.entity';
import { Product } from '../_common/entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { memoryStorage } from 'multer';
import { imageFileFilter, imageMaxSize } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promo, Product]),
    UploadModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: imageMaxSize,
      },
    }),
  ],
  controllers: [PromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}

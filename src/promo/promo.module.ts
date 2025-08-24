import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PromoService } from './promo.service';
import { PromoController } from './promo.controller';
import { Promo } from '../_common/entities/promo.entity';
import { Product } from '../_common/entities/product.entity';
import { diskStorage } from 'multer';
import { fileNameEdit } from '../_common/utils/file-name-edit.util';
import { imageFileFilter } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promo, Product]),
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
  controllers: [PromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}

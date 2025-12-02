import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TestimonialService } from './testimonial.service';
import { I18nModule } from '../i18n/i18n.module';
import { TestimonialController } from './testimonial.controller';
import { Testimonial } from '../_common/entities/testimonial.entity';
import { UploadModule } from '../upload/upload.module';
import { memoryStorage } from 'multer';
import { imageFileFilter, imageMaxSize } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial]),
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
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}

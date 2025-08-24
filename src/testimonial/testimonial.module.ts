import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';
import { Testimonial } from '../_common/entities/testimonial.entity';
import { diskStorage } from 'multer';
import { fileNameEdit } from '../_common/utils/file-name-edit.util';
import { imageFileFilter } from '../_common/utils/file-validation.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial]),
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
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}

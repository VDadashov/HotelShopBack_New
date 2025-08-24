import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import {
  imageFileFilter,
  pdfFileFilter,
  videoFileFilter,
  imageMaxSize,
  pdfMaxSize,
  videoMaxSize,
} from '../_common/utils/file-validation.util';
import { MulterExceptionFilter } from '../_common/filters/multer-exception.filter';

function fileNameEdit(req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + extname(file.originalname));
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Şəkil yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ status: 201, description: 'Şəkil uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/images',
        filename: fileNameEdit,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: imageMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file, 'images');
  }

  @Post('pdf')
  @ApiOperation({ summary: 'PDF yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPdfDto })
  @ApiResponse({ status: 201, description: 'PDF uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/pdfs',
        filename: fileNameEdit,
      }),
      fileFilter: pdfFileFilter,
      limits: { fileSize: pdfMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file, 'pdfs');
  }

  @Post('video')
  @ApiOperation({ summary: 'Video yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadVideoDto })
  @ApiResponse({ status: 201, description: 'Video uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/videos',
        filename: fileNameEdit,
      }),
      fileFilter: videoFileFilter,
      limits: { fileSize: videoMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFile(file, 'videos');
  }
}

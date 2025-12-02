import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { UploadQueryDto } from './dto/upload-query.dto';
import {
  imageFileFilter,
  pdfFileFilter,
  videoFileFilter,
  imageMaxSize,
  pdfMaxSize,
  videoMaxSize,
} from '../_common/utils/file-validation.util';
import { MulterExceptionFilter } from '../_common/filters/multer-exception.filter';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bütün yüklənmiş faylları gətir (pagination və filter ilə)' })
  @ApiResponse({
    status: 200,
    description: 'Faylların siyahısı',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              publicId: { type: 'string', example: 'hotelshop/images/1764608698070-364854808' },
              url: { type: 'string', example: 'https://res.cloudinary.com/...' },
              format: { type: 'string', example: 'png' },
              width: { type: 'number', example: 1920 },
              height: { type: 'number', example: 1080 },
              bytes: { type: 'number', example: 1668186 },
              createdAt: { type: 'string', example: '2024-01-01T00:00:00Z' },
              folder: { type: 'string', example: 'hotelshop/images' },
              resourceType: { type: 'string', example: 'image' },
              filename: { type: 'string', example: '1764608698070-364854808.png' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
            currentPage: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 10 },
          },
        },
        message: { type: 'string', example: 'Fayllar uğurla əldə edildi' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async getAllFiles(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: false,
        skipMissingProperties: true,
        forbidUnknownValues: false,
      }),
    )
    queryDto: UploadQueryDto,
  ) {
    const result = await this.uploadService.getAllFiles(queryDto);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Fayllar uğurla əldə edildi',
    };
  }

  @Post('image')
  @ApiOperation({ summary: 'Şəkil yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ status: 201, description: 'Şəkil uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: imageMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.saveFile(file, 'images');
  }

  @Post('pdf')
  @ApiOperation({ summary: 'PDF yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadPdfDto })
  @ApiResponse({ status: 201, description: 'PDF uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: pdfFileFilter,
      limits: { fileSize: pdfMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.saveFile(file, 'pdfs');
  }

  @Post('video')
  @ApiOperation({ summary: 'Video yüklə' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadVideoDto })
  @ApiResponse({ status: 201, description: 'Video uğurla yükləndi' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: videoFileFilter,
      limits: { fileSize: videoMaxSize },
    }),
  )
  @UseFilters(MulterExceptionFilter)
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.saveFile(file, 'videos');
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Faylı Cloudinary-dən sil' })
  @ApiBody({ type: DeleteFileDto })
  @ApiResponse({
    status: 200,
    description: 'Fayl uğurla silindi',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Fayl uğurla silindi' },
        result: {
          type: 'object',
          properties: {
            result: { type: 'string', example: 'ok' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış publicId və ya fayl tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async deleteFile(@Body() deleteFileDto: DeleteFileDto) {
    const result = await this.uploadService.deleteFile(
      deleteFileDto.publicId,
      deleteFileDto.resourceType || 'image',
    );

    return {
      success: true,
      message: 'Fayl uğurla silindi',
      result,
    };
  }
}

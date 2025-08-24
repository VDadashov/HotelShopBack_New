import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get()
  @ApiOperation({ summary: 'Bütün testimonialları gətir (axtarış və filter ilə)' })
  @ApiResponse({
    status: 200,
    description: 'Testimonial siyahısı',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Aktiv testimonialları filterlə',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Müştəri adı və ya rəyində axtarış',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['az', 'en', 'ru'],
    description: 'Axtarış dili',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'name-az', 'name-za'],
    description: 'Sıralama növü',
  })
  async findAll(@Query() query: TestimonialQueryDto) {
    return await this.testimonialService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Aktiv testimonialları gətir' })
  @ApiResponse({
    status: 200,
    description: 'Aktiv testimonial siyahısı',
  })
  async getActiveTestimonials() {
    return await this.testimonialService.getActiveTestimonials();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ilə testimonial gətir' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Testimonial ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonial obyekti',
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial tapılmadı',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.testimonialService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yeni testimonial yarat' })
  @ApiBody({
    description: 'Testimonial məlumatları',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Əli Məmmədov' },
            en: { type: 'string', example: 'Ali Mammadov' },
            ru: { type: 'string', example: 'Али Мамедов' },
          },
        },
        message: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Bu xidmət çox yaxşıdır...' },
            en: { type: 'string', example: 'This service is very good...' },
            ru: { type: 'string', example: 'Эта услуга очень хорошая...' },
          },
        },
        isActive: { type: 'boolean', example: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Müştəri şəkli',
        },
      },
      required: ['name', 'message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Testimonial uğurla yaradıldı',
  })
  @ApiResponse({
    status: 400,
    description: 'Validasiya xətası',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createTestimonialDto.imageUrl = `/uploads/images/${file.filename}`;
    }
    return await this.testimonialService.create(createTestimonialDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Testimonial yenilə' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Testimonial ID-si',
  })
  @ApiBody({
    description: 'Yenilənəcək testimonial məlumatları',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        message: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        isActive: { type: 'boolean' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Yeni müştəri şəkli',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonial uğurla yeniləndi',
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateTestimonialDto.imageUrl = `/uploads/images/${file.filename}`;
    }
    return await this.testimonialService.update(id, updateTestimonialDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Testimonial sil' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Testimonial ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonial uğurla silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.testimonialService.remove(id);
  }
}

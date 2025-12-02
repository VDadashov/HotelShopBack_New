import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { Testimonial } from '../_common/entities/testimonial.entity';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
  constructor(
    private readonly testimonialService: TestimonialService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Yeni testimonial yaratmaq',
  })
  @ApiBody({ type: CreateTestimonialDto })
  @ApiResponse({
    status: 201,
    description: 'Testimonial uğurla yaradıldı',
    type: Testimonial,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya validasiya xətası',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createTestimonialDto: CreateTestimonialDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ success: boolean; data: Testimonial; message: string }> {
    if (file) {
      const uploadResult = await this.uploadService.saveFile(file, 'images');
      createTestimonialDto.imageUrl = uploadResult.media.url;
    }
    const testimonial =
      await this.testimonialService.create(createTestimonialDto);
    return {
      success: true,
      data: testimonial,
      message: 'Testimonial uğurla yaradıldı',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Bütün testimonialları əldə etmək',
    description:
      'Filtrlər və sıralama ilə testimonialların siyahısını qaytarır',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Müştəri adı və ya rəyində axtarış',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    type: Number,
    description: 'Minimum reytinq (1-5)',
    example: 4,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'name-az', 'name-za', 'rating-high', 'rating-low'],
    description: 'Sıralama növü',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonialların siyahısı uğurla qaytarıldı',
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: false,
        skipMissingProperties: true,
        forbidUnknownValues: false,
      }),
    )
    queryDto: TestimonialQueryDto,
    @Query('isActive') isActive?: boolean,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    // isActive parametrini queryDto-ya əlavə et
    if (isActive !== undefined) {
      queryDto.isActive = isActive;
    }

    if (allLanguages) {
      const result = await this.testimonialService.findAllForAdmin(queryDto);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Testimoniallar uğurla əldə edildi',
      };
    }

    const result = await this.testimonialService.findAll(
      queryDto,
      acceptLanguage,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Testimoniallar uğurla əldə edildi',
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Bütün testimonialları əldə etmək (filtrsiz)',
    description: 'Filtrsiz bütün testimonialların siyahısını qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Bütün testimoniallar uğurla qaytarıldı',
  })
  async getAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const testimonials = await this.testimonialService.getAllForAdmin();
      return {
        success: true,
        data: testimonials,
        message: 'Bütün testimoniallar uğurla əldə edildi',
      };
    }

    const testimonials = await this.testimonialService.getAll(acceptLanguage);
    return {
      success: true,
      data: testimonials,
      message: 'Bütün testimoniallar uğurla əldə edildi',
    };
  }

  @Get('active')
  @ApiOperation({
    summary: 'Aktiv testimonialları əldə etmək',
    description: 'Yalnız aktiv testimonialları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Aktiv testimoniallar uğurla qaytarıldı',
  })
  async getActiveTestimonials(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const testimonials =
        await this.testimonialService.getActiveTestimonialsForAdmin();
      return {
        success: true,
        data: testimonials,
        message: 'Aktiv testimoniallar uğurla əldə edildi',
      };
    }

    const testimonials =
      await this.testimonialService.getActiveTestimonials(acceptLanguage);
    return {
      success: true,
      data: testimonials,
      message: 'Aktiv testimoniallar uğurla əldə edildi',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID-yə görə testimonial tapmaq',
    description: 'Müəyyən ID-li testimonialı qaytarır',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Testimonialın ID-si',
    example: 1,
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonial uğurla tapıldı',
    type: Testimonial,
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial tapılmadı',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const testimonial = await this.testimonialService.findOneForAdmin(id);
      return {
        success: true,
        data: testimonial,
        message: 'Testimonial uğurla tapıldı',
      };
    }

    const testimonial = await this.testimonialService.findOne(
      id,
      acceptLanguage,
    );
    return {
      success: true,
      data: testimonial,
      message: 'Testimonial uğurla tapıldı',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Testimonialı yeniləmək',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Yenilənəcək testimonialın ID-si',
    example: 1,
  })
  @ApiBody({ type: UpdateTestimonialDto })
  @ApiResponse({
    status: 200,
    description: 'Testimonial uğurla yeniləndi',
    type: Testimonial,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya validasiya xətası',
  })
  @ApiResponse({
    status: 404,
    description: 'Testimonial tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<{ success: boolean; data: Testimonial; message: string }> {
    const testimonial = await this.testimonialService.update(
      id,
      updateTestimonialDto,
    );

    return {
      success: true,
      data: testimonial,
      message: 'Testimonial uğurla yeniləndi',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Testimonialı silmək',
    description: 'Yalnız admin tərəfindən testimonial silinə bilər.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Silinəcək testimonialın ID-si',
    example: 1,
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
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.testimonialService.remove(id);
    return {
      success: true,
      message: 'Testimonial uğurla silindi',
    };
  }
}

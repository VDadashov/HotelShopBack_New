import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Put,
  Headers,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { Faq } from '../_common/entities/faq.entity';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({
    summary: 'Bütün FAQ-ları əldə etmək',
    description: 'Filtrlər və paginasiya ilə FAQ-ların siyahısını qaytarır',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Aktiv FAQ-ları filterlə',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Sual və ya cavabda axtarış (bütün dillərdə)',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description:
      'Admin üçün bütün dillər (əks halda Accept-Language header istifadə edilir)',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ-ların siyahısı uğurla qaytarıldı',
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        skipMissingProperties: true,
        forbidUnknownValues: false,
      }),
    )
    queryDto: FaqQueryDto,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    if (allLanguages) {
      const result = await this.faqService.findAllForAdmin(queryDto);
      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
        message: 'FAQ-lar uğurla əldə edildi',
      };
    }

    const result = await this.faqService.findAll(queryDto, acceptLanguage, isActive);
    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      message: 'FAQ-lar uğurla əldə edildi',
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Bütün FAQ-ları əldə etmək (filtrsiz)',
    description: 'Filtrsiz bütün FAQ-ların siyahısını qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description:
      'Admin üçün bütün dillər (əks halda Accept-Language header istifadə edilir)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bütün FAQ-lar uğurla qaytarıldı',
  })
  async getAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const faqs = await this.faqService.getAllForAdmin();
      return {
        success: true,
        data: faqs,
        message: 'Bütün FAQ-lar uğurla əldə edildi',
      };
    }

    const faqs = await this.faqService.getAll(acceptLanguage);
    return {
      success: true,
      data: faqs,
      message: 'Bütün FAQ-lar uğurla əldə edildi',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID-yə görə FAQ tapmaq',
    description: 'Müəyyən ID-li FAQ-ı qaytarır',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'FAQ-ın ID-si',
    example: 1,
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description:
      'Admin üçün bütün dillər (əks halda Accept-Language header istifadə edilir)',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ uğurla tapıldı',
    type: Faq,
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ tapılmadı',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const faq = await this.faqService.findOneForAdmin(id);
      return {
        success: true,
        data: faq,
        message: 'FAQ uğurla tapıldı',
      };
    }

    const faq = await this.faqService.findOne(id, acceptLanguage);
    return {
      success: true,
      data: faq,
      message: 'FAQ uğurla tapıldı',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni FAQ yaratmaq' })
  @ApiBody({ type: CreateFaqDto })
  @ApiResponse({
    status: 201,
    description: 'FAQ uğurla yaradıldı',
    type: Faq,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya validation xətası',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createFaqDto: CreateFaqDto,
  ): Promise<{ success: boolean; data: Faq; message: string }> {
    const faq = await this.faqService.create(createFaqDto);
    return {
      success: true,
      data: faq,
      message: 'FAQ uğurla yaradıldı',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'FAQ-ı yeniləmək' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Yenilənəcək FAQ-ın ID-si',
    example: 1,
  })
  @ApiBody({ type: UpdateFaqDto })
  @ApiResponse({
    status: 200,
    description: 'FAQ uğurla yeniləndi',
    type: Faq,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya validation xətası',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateFaqDto: UpdateFaqDto,
  ): Promise<{ success: boolean; data: Faq; message: string }> {
    const faq = await this.faqService.update(id, updateFaqDto);
    return {
      success: true,
      data: faq,
      message: 'FAQ uğurla yeniləndi',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'FAQ-ı silmək',
    description: 'Yalnız admin tərəfindən FAQ silinə bilər',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Silinəcək FAQ-ın ID-si',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ uğurla silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.faqService.remove(id);
    return {
      success: true,
      message: 'FAQ uğurla silindi',
    };
  }
}

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
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PromoQueryDto } from './dto/promo-query.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';

@ApiTags('Promos')
@Controller('promos')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  @ApiOperation({ summary: 'Bütün promoları gətir (axtarış və filter ilə)' })
  @ApiResponse({
    status: 200,
    description: 'Promo siyahısı',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Aktiv promoları filterlə',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: Number,
    description: 'Məhsul ID-si ilə filterlə',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Promo başlıq və ya təsvirində axtarış',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['az', 'en', 'ru'],
    description: 'Axtarış dili',
  })
  @ApiQuery({
    name: 'current',
    required: false,
    type: Boolean,
    description: 'Hazırda aktiv olan promoları filterlə',
  })
  @ApiQuery({
    name: 'startDateFrom',
    required: false,
    type: String,
    description: 'Müəyyən tarixdən sonrakı promoları filterlə',
  })
  @ApiQuery({
    name: 'startDateTo',
    required: false,
    type: String,
    description: 'Müəyyən tarixə qədər başlayan promoları filterlə',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'start-date-asc', 'start-date-desc', 'end-date-asc', 'end-date-desc'],
    description: 'Sıralama növü',
  })
  async findAll(@Query() query: PromoQueryDto) {
    return await this.promoService.findAll(query);
  }

  @Get('current')
  @ApiOperation({ summary: 'Hazırda aktiv olan promoları gətir' })
  @ApiResponse({
    status: 200,
    description: 'Hazırda aktiv promo siyahısı',
  })
  async getCurrentPromos() {
    return await this.promoService.getCurrentPromos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ilə promo gətir' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Promo ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Promo obyekti',
  })
  @ApiResponse({
    status: 404,
    description: 'Promo tapılmadı',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.promoService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('backgroundImg'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Yeni promo yarat' })
  @ApiBody({
    description: 'Promo məlumatları',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Yay Promosiyası' },
            en: { type: 'string', example: 'Summer Promotion' },
            ru: { type: 'string', example: 'Летняя акция' },
          },
        },
        subtitle: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Böyük endirim!' },
            en: { type: 'string', example: 'Big discount!' },
            ru: { type: 'string', example: 'Большая скидка!' },
          },
        },
        description: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Bu yay böyük endirimlər...' },
            en: { type: 'string', example: 'This summer great discounts...' },
            ru: { type: 'string', example: 'Этим летом большие скидки...' },
          },
        },
        startDate: { type: 'string', format: 'date-time', example: '2024-06-01T00:00:00.000Z' },
        endDate: { type: 'string', format: 'date-time', example: '2024-08-31T23:59:59.000Z' },
        productId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        backgroundImg: {
          type: 'string',
          format: 'binary',
          description: 'Promo arxa plan şəkli',
        },
      },
      required: ['title', 'startDate', 'endDate', 'productId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Promo uğurla yaradıldı',
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
    @Body() createPromoDto: CreatePromoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createPromoDto.backgroundImg = `/uploads/images/${file.filename}`;
    }
    return await this.promoService.create(createPromoDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('backgroundImg'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Promo yenilə' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Promo ID-si',
  })
  @ApiBody({
    description: 'Yenilənəcək promo məlumatları',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        subtitle: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        description: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        productId: { type: 'number' },
        isActive: { type: 'boolean' },
        backgroundImg: {
          type: 'string',
          format: 'binary',
          description: 'Yeni promo arxa plan şəkli',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Promo uğurla yeniləndi',
  })
  @ApiResponse({
    status: 404,
    description: 'Promo tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromoDto: UpdatePromoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updatePromoDto.backgroundImg = `/uploads/images/${file.filename}`;
    }
    return await this.promoService.update(id, updatePromoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promo sil' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Promo ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Promo uğurla silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'Promo tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.promoService.remove(id);
  }
}

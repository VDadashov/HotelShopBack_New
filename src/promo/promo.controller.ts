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
  ValidationPipe,
  Put,
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
    enum: ['newest', 'oldest', 'start-date-asc', 'start-date-desc', 'end-date-asc', 'end-date-desc', 'title-az', 'title-za'],
    description: 'Sıralama növü',
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
    query: PromoQueryDto,
    @Query('isActive') isActive?: boolean,
  ) {
    // isActive parametrini query-ya əlavə et
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni promo yarat' })
  @ApiBody({ type: CreatePromoDto })
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
  async create(@Body() createPromoDto: CreatePromoDto) {
    return await this.promoService.create(createPromoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promo yenilə' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Promo ID-si',
  })
  @ApiBody({ type: UpdatePromoDto })
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
  ) {
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

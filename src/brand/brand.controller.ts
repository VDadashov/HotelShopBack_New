// src/brand/brand.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  Put,
  Patch,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { Brand } from '../_common/entities/brand.entity';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Yeni brand yaratmaq',
    description: 'Yalnız admin tərəfindən yeni brand yaradıla bilər',
  })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: 'Brand uğurla yaradıldı',
    type: Brand,
  })
  @ApiResponse({
    status: 400,
    description: 'Eyni adda brand artıq mövcuddur və ya yanlış məlumatlar',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createBrandDto: CreateBrandDto,
  ): Promise<{ success: boolean; data: Brand; message: string }> {
    const brand = await this.brandService.create(createBrandDto);
    return {
      success: true,
      data: brand,
      message: 'Brand uğurla yaradıldı',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Bütün brandları əldə etmək',
    description: 'Filtrlər və paginasiya ilə brandların siyahısını qaytarır',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Brandların siyahısı uğurla qaytarıldı',
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
    queryDto: BrandQueryDto,
    @Query('isActive') isActive?: boolean,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    // isActive parametrini queryDto-ya əlavə et
    if (isActive !== undefined) {
      queryDto.isActive = isActive;
    }

    if (allLanguages) {
      const result = await this.brandService.findAllForAdmin(queryDto);
      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
        message: 'Brandlar uğurla əldə edildi',
      };
    }

    const result = await this.brandService.findAll(queryDto, acceptLanguage);
    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      message: 'Brandlar uğurla əldə edildi',
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Bütün brandları əldə etmək (filtrsiz)',
    description: 'Filtrsiz bütün brandların siyahısını qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Aktiv status filtri',
  })
  @ApiResponse({
    status: 200,
    description: 'Bütün brandlar uğurla qaytarıldı',
    type: [Brand],
  })
  async getAll(
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: false,
        skipMissingProperties: true,
        forbidUnknownValues: false,
      }),
    )
    queryParams: { allLanguages?: boolean; isActive?: boolean },
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const { allLanguages, isActive } = queryParams;

    if (allLanguages) {
      const brands = await this.brandService.getAllForAdmin(isActive);
      return {
        success: true,
        data: brands,
        message: 'Bütün brandlar uğurla əldə edildi',
      };
    }

    const brands = await this.brandService.getAll(acceptLanguage, isActive);
    return {
      success: true,
      data: brands,
      message: 'Bütün brandlar uğurla əldə edildi',
    };
  }

  @Get('active')
  @ApiOperation({
    summary: 'Aktiv brandları əldə etmək',
    description: 'Yalnız aktiv statusda olan brandları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Aktiv brandlar uğurla qaytarıldı',
    type: [Brand],
  })
  async getActiveBrands(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const brands = await this.brandService.getActiveBrandsForAdmin();
      return {
        success: true,
        data: brands,
        message: 'Aktiv brandlar uğurla əldə edildi',
      };
    }

    const brands = await this.brandService.getActiveBrands(acceptLanguage);
    return {
      success: true,
      data: brands,
      message: 'Aktiv brandlar uğurla əldə edildi',
    };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Brand adı ilə axtarış',
    description: 'Brand adında axtarış aparır',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Axtarış ediləcək brand adı',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Axtarış nəticələri uğurla qaytarıldı',
    type: [Brand],
  })
  async searchByName(
    @Query('name') name: string,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const brands = await this.brandService.searchByNameForAdmin(name);
      return {
        success: true,
        data: brands,
        message: 'Axtarış nəticələri uğurla əldə edildi',
      };
    }

    const brands = await this.brandService.searchByName(name, acceptLanguage);
    return {
      success: true,
      data: brands,
      message: 'Axtarış nəticələri uğurla əldə edildi',
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Brand statistikalarını əldə etmək',
    description: 'Ümumi, aktiv və passiv brandların sayını qaytarır',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistikalar uğurla qaytarıldı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async getStats() {
    const stats = await this.brandService.getStats();
    return {
      success: true,
      data: stats,
      message: 'Statistikalar uğurla əldə edildi',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID-yə görə brand tapmaq',
    description: 'Müəyyən ID-li brandı qaytarır',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Brandın ID-si',
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
    description: 'Brand uğurla tapıldı',
    type: Brand,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tapılmadı',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const brand = await this.brandService.findOneForAdmin(id);
      return {
        success: true,
        data: brand,
        message: 'Brand uğurla tapıldı',
      };
    }

    const brand = await this.brandService.findOne(id, acceptLanguage);
    return {
      success: true,
      data: brand,
      message: 'Brand uğurla tapıldı',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Brandı yeniləmək',
    description: 'Mövcud brandın məlumatlarını yeniləyir',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Yenilənəcək brandın ID-si',
    example: 1,
  })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({
    status: 200,
    description: 'Brand uğurla yeniləndi',
    type: Brand,
  })
  @ApiResponse({
    status: 400,
    description: 'Eyni adda brand artıq mövcuddur və ya yanlış məlumatlar',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateBrandDto: UpdateBrandDto,
  ): Promise<{ success: boolean; data: Brand; message: string }> {
    const brand = await this.brandService.update(id, updateBrandDto);
    return {
      success: true,
      data: brand,
      message: 'Brand uğurla yeniləndi',
    };
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Brand statusunu dəyişmək',
    description: 'Brandın aktiv/passiv statusunu dəyişir',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Statusu dəyişəcək brandın ID-si',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Brand statusu uğurla dəyişdirildi',
    type: Brand,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; data: Brand; message: string }> {
    const brand = await this.brandService.toggleStatus(id);
    return {
      success: true,
      data: brand,
      message: `Brand ${brand.isActive ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Brandı silmək',
    description: 'Yalnız admin tərəfindən brand silinə bilər',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Silinəcək brandın ID-si',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Brand uğurla silindi',
  })
  @ApiResponse({
    status: 400,
    description: 'Bu brand ilə bağlı məhsullar mövcuddur',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.brandService.remove(id);
    return {
      success: true,
      message: 'Brand uğurla silindi',
    };
  }
}

// src/category/category.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  Put,
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { Category } from '../_common/entities/category.entity';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { MenuItemDto } from './dto/menu-item.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('menu')
  @ApiOperation({
    summary: 'Menyu strukturunu əldə etmək',
    description: 'Hierarchik menyu strukturunda aktiv kateqoriyaları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Menyu strukturu uğurla qaytarıldı',
    type: [MenuItemDto], // ✅ Swagger üçün
  })
  async getMenu(
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<{ success: boolean; data: MenuItemDto[]; message: string }> {
    const menu = await this.categoryService.getMenu(acceptLanguage);
    return {
      success: true,
      data: menu,
      message: 'Menyu strukturu uğurla əldə edildi',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Yeni kateqoriya yaratmaq',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Kateqoriya uğurla yaradıldı',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya business rule pozuntusu',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent kateqoriya tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
  ): Promise<{ success: boolean; data: Category; message: string }> {
    const category = await this.categoryService.create(createCategoryDto);
    return {
      success: true,
      data: category,
      message: 'Kateqoriya uğurla yaradıldı',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Bütün kateqoriyaları əldə etmək',
    description:
      'Filtrlər və paginasiya ilə kateqoriyaların siyahısını qaytarır',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'parentId', required: false, type: Number })
  @ApiQuery({ name: 'level', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Kateqoriyaların siyahısı uğurla qaytarıldı',
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
    queryDto: CategoryQueryDto,
    @Query('isActive') isActive?: boolean,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    // isActive parametrini queryDto-ya əlavə et
    if (isActive !== undefined) {
      queryDto.isActive = isActive;
    }

    if (allLanguages) {
      const result = await this.categoryService.findAllForAdmin(queryDto);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Kateqoriyalar uğurla əldə edildi',
      };
    }

    const result = await this.categoryService.findAll(queryDto, acceptLanguage);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Kateqoriyalar uğurla əldə edildi',
    };
  }

  @Get('all')
  @ApiOperation({
    summary: 'Bütün kateqoriyaları əldə etmək (filtrsiz)',
    description: 'Filtrsiz bütün kateqoriyaların siyahısını qaytarır',
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
    description: 'Bütün kateqoriyalar uğurla qaytarıldı',
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
      const categories = await this.categoryService.getAllForAdmin(isActive);
      return {
        success: true,
        data: categories,
        message: 'Bütün kateqoriyalar uğurla əldə edildi',
      };
    }

    const categories = await this.categoryService.getAll(acceptLanguage, isActive);
    return {
      success: true,
      data: categories,
      message: 'Bütün kateqoriyalar uğurla əldə edildi',
    };
  }

  @Get('root')
  @ApiOperation({
    summary: 'Root kateqoriyaları əldə etmək',
    description: 'Yalnız birinci səviyyədəki kateqoriyaları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Root kateqoriyalar uğurla qaytarıldı',
  })
  async getRootCategories(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const categories = await this.categoryService.getRootCategoriesForAdmin();
      return {
        success: true,
        data: categories,
        message: 'Root kateqoriyalar uğurla əldə edildi',
      };
    }

    const categories =
      await this.categoryService.getRootCategories(acceptLanguage);
    return {
      success: true,
      data: categories,
      message: 'Root kateqoriyalar uğurla əldə edildi',
    };
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Kateqoriya ağacını əldə etmək',
    description: 'Hierarchik strukturda bütün kateqoriyaları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Kateqoriya ağacı uğurla qaytarıldı',
  })
  async getCategoryTree(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const tree = await this.categoryService.getCategoryTreeForAdmin();
      return {
        success: true,
        data: tree,
        message: 'Kateqoriya ağacı uğurla əldə edildi',
      };
    }

    const tree = await this.categoryService.getCategoryTree(acceptLanguage);
    return {
      success: true,
      data: tree,
      message: 'Kateqoriya ağacı uğurla əldə edildi',
    };
  }

  @Get('product-holders')
  @ApiOperation({
    summary: 'Məhsul saxlaya bilən kateqoriyaları əldə etmək',
    description: 'isProductHolder=true olan kateqoriyaları qaytarır',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul saxlayan kateqoriyalar uğurla qaytarıldı',
  })
  async getProductHolderCategories(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const categories =
        await this.categoryService.getProductHolderCategoriesForAdmin();
      return {
        success: true,
        data: categories,
        message: 'Məhsul saxlayan kateqoriyalar uğurla əldə edildi',
      };
    }

    const categories =
      await this.categoryService.getProductHolderCategories(acceptLanguage);
    return {
      success: true,
      data: categories,
      message: 'Məhsul saxlayan kateqoriyalar uğurla əldə edildi',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ID-yə görə kateqoriya tapmaq',
    description:
      'Müəyyən ID-li kateqoriyanı parent, children və products məlumatları ilə birlikdə qaytarır',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Kateqoriyanın ID-si',
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
    description: 'Kateqoriya uğurla tapıldı',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Kateqoriya tapılmadı',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const category = await this.categoryService.findOneForAdmin(id);
      return {
        success: true,
        data: category,
        message: 'Kateqoriya uğurla tapıldı',
      };
    }

    const category = await this.categoryService.findOne(id, acceptLanguage);
    return {
      success: true,
      data: category,
      message: 'Kateqoriya uğurla tapıldı',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kateqoriyanı yeniləmək',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Yenilənəcək kateqoriyanın ID-si',
    example: 1,
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Kateqoriya uğurla yeniləndi',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Yanlış məlumatlar və ya business rule pozuntusu',
  })
  @ApiResponse({
    status: 404,
    description: 'Kateqoriya və ya parent kateqoriya tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ success: boolean; data: Category; message: string }> {
    const category = await this.categoryService.update(id, updateCategoryDto);
    return {
      success: true,
      data: category,
      message: 'Kateqoriya uğurla yeniləndi',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kateqoriyanı silmək',
    description:
      'Yalnız admin tərəfindən kateqoriya silinə bilər. Alt kateqoriyası olan kateqoriya silinə bilməz.',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Silinəcək kateqoriyanın ID-si',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Kateqoriya uğurla silindi',
  })
  @ApiResponse({
    status: 400,
    description: 'Alt kateqoriyaları olan kateqoriya silinə bilməz',
  })
  @ApiResponse({
    status: 404,
    description: 'Kateqoriya tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'İcazə yoxdur',
  })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.categoryService.remove(id);
    return {
      success: true,
      message: 'Kateqoriya uğurla silindi',
    };
  }
}

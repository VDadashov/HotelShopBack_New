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
  Headers,
  ValidationPipe,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Bütün məhsulları gətir (səhifələmə, axtarış, filter ilə)' })
  @ApiResponse({
    status: 200,
    description: 'Səhifələnmiş məhsul siyahısı',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Səhifə nömrəsi',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Hər səhifədə məhsul sayı',
    example: 10,
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Kateqoriya ID-si ilə filterlə',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Aktiv məhsulları filterlə',
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    type: String,
    description: 'Məhsul adı və ya təsvirində axtarış',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['az', 'za', 'newest', 'oldest', 'most-viewed'],
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
    queryDto: ProductQueryDto,
    @Query('allLanguages') allLanguages?: boolean,
    @Query('isActive') isActive?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    // isActive parametrini queryDto-ya əlavə et
    if (isActive !== undefined) {
      queryDto.isActive = isActive;
    }
    
    if (allLanguages) {
      const result = await this.productService.findAllForAdmin(queryDto);
      return {
        success: true,
        data: result.data,
        pagination: {
          totalItems: result.pagination.totalItems,
          totalPages: result.pagination.totalPages,
          currentPage: result.pagination.currentPage,
          pageSize: result.pagination.pageSize,
        },
        message: 'Məhsullar uğurla əldə edildi',
      };
    }

    const result = await this.productService.findAll(queryDto, acceptLanguage);
    return {
      success: true,
      data: result.data,
      pagination: {
        totalItems: result.pagination.totalItems,
        totalPages: result.pagination.totalPages,
        currentPage: result.pagination.currentPage,
        pageSize: result.pagination.pageSize,
      },
      message: 'Məhsullar uğurla əldə edildi',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ilə məhsul gətir' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul obyekti',
  })
  @ApiResponse({
    status: 404,
    description: 'Məhsul tapılmadı',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      const product = await this.productService.findOneForAdmin(id);
      return {
        success: true,
        data: product,
        message: 'Məhsul uğurla tapıldı',
      };
    }

    const product = await this.productService.findOne(id, acceptLanguage);
    return {
      success: true,
      data: product,
      message: 'Məhsul uğurla tapıldı',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('mainImg'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni məhsul yarat' })
  @ApiBody({
    description: 'Məhsul məlumatları',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Samsung Galaxy S21' },
            en: { type: 'string', example: 'Samsung Galaxy S21' },
            ru: { type: 'string', example: 'Самсунг Галакси S21' },
          },
        },
        description: {
          type: 'object',
          properties: {
            az: { type: 'string', example: 'Məhsul haqqında ətraflı məlumat...' },
            en: { type: 'string', example: 'Detailed product information...' },
            ru: { type: 'string', example: 'Подробная информация о продукте...' },
          },
        },
        categoryId: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        mainImg: {
          type: 'string',
          format: 'binary',
          description: 'Məhsul şəkli',
        },
      },
      required: ['name', 'categoryId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Məhsul uğurla yaradıldı',
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
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.uploadService.saveFile(file, 'images');
      createProductDto.mainImg = uploadResult.media.url;
    }
    return await this.productService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('mainImg'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Məhsulu yenilə' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiBody({
    description: 'Yenilənəcək məhsul məlumatları',
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
        description: {
          type: 'object',
          properties: {
            az: { type: 'string' },
            en: { type: 'string' },
            ru: { type: 'string' },
          },
        },
        categoryId: { type: 'number' },
        isActive: { type: 'boolean' },
        mainImg: {
          type: 'string',
          format: 'binary',
          description: 'Yeni məhsul şəkli',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul uğurla yeniləndi',
  })
  @ApiResponse({
    status: 404,
    description: 'Məhsul tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.uploadService.saveFile(file, 'images');
      updateProductDto.mainImg = uploadResult.media.url;
    }
    return await this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Məhsulu sil' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul uğurla silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'Məhsul tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.remove(id);
  }

  @Patch(':id/views')
  @ApiOperation({ summary: 'Məhsul baxış sayını artır' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Baxış sayı artırıldı',
  })
  @ApiResponse({
    status: 404,
    description: 'Məhsul tapılmadı',
  })
  async incrementViews(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.incrementViews(id);
  }
}

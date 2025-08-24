// page.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/_common/guards/roles.guard';
import { Roles } from 'src/_common/decorators/roles.decorator';

@ApiTags('Pages')
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active pages' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active pages',
  })
  async findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      return await this.pageService.findAllForAdmin();
    }
    return await this.pageService.findAll(acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      return await this.pageService.findOneForAdmin(id);
    }
    return await this.pageService.findOne(id, acceptLanguage);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new page' })
  @ApiBody({
    type: CreatePageDto,
    examples: {
      example1: {
        summary: 'Create Home Page',
        value: {
          title: {
            az: 'Ana Səhifə',
            en: 'Home Page',
            ru: 'Главная страница',
          },
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Page created successfully',
  })
  async create(@Body() dto: CreatePageDto) {
    return this.pageService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update page' })
  @ApiBody({ type: UpdatePageDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    const page = await this.pageService.update(id, updatePageDto);
    return {
      success: true,
      message: 'Page successfully updated',
      data: page,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete page' })
  @ApiResponse({
    status: 200,
    description: 'Page deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Page successfully deleted' },
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.pageService.remove(id);
  }
}

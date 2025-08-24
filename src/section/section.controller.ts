import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from '../_common/entities/section.entity';

@ApiTags('Sections')
@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni section yarat' })
  @ApiResponse({ status: 201, type: Section })
  async create(@Body() createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionService.create(createSectionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Bütün section-ları gətir (müxtəlif filterlər ilə)',
  })
  @ApiQuery({
    name: 'pageId',
    required: false,
    type: Number,
    description: 'Müəyyən page-ə aid section-lar',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Section tipinə görə filter (məs: header, footer, hero)',
  })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({ status: 200, type: [Section] })
  async findAll(
    @Query('pageId') pageId?: string,
    @Query('type') type?: string,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<Section[]> {
    if (allLanguages) {
      return await this.sectionService.findAllForAdmin();
    }

    return this.sectionService.findAllWithSelectedLanguage(
      pageId ? Number(pageId) : undefined,
      type,
      acceptLanguage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ilə section tap' })
  @ApiResponse({ status: 200, type: Section })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Section> {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Section yenilə' })
  @ApiResponse({ status: 200, type: Section })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    return this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Section sil' })
  @ApiResponse({ status: 200, description: 'Uğurla silindi' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sectionService.remove(id);
  }
}

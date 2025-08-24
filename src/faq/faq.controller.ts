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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { RolesGuard } from '../_common/guards/roles.guard';
import { Roles } from '../_common/decorators/roles.decorator';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Bütün FAQ-ları gətir' })
  @ApiResponse({
    status: 200,
    description: 'FAQ siyahısı uğurla gətirildi',
  })
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
    name: 'lang',
    required: false,
    enum: ['az', 'en', 'ru'],
    description: 'Axtarış dili (müəyyən dildə axtarış üçün)',
  })
  async findAll(@Query() query: FaqQueryDto) {
    return await this.faqService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ilə FAQ gətir' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'FAQ ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ obyekti uğurla gətirildi',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ tapılmadı',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.faqService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni FAQ əlavə et' })
  @ApiResponse({
    status: 201,
    description: 'FAQ uğurla yaradıldı',
  })
  @ApiResponse({
    status: 400,
    description: 'Validasiya xətası',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async create(@Body() createFaqDto: CreateFaqDto) {
    return await this.faqService.create(createFaqDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'FAQ-ı yenilə' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'FAQ ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'FAQ uğurla yeniləndi',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ tapılmadı',
  })
  @ApiResponse({
    status: 401,
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return await this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'FAQ-ı sil' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'FAQ ID-si',
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
    description: 'Qeyri-təsdiq edilmiş istifadəçi',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.faqService.remove(id);
  }
}

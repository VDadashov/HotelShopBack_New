import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadQueryDto {
  @ApiPropertyOptional({
    description: 'Səhifə nömrəsi',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə nömrəsi rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə nömrəsi 1-dən kiçik ola bilməz' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Hər səhifədə fayl sayı',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə ölçüsü rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə ölçüsü 1-dən kiçik ola bilməz' })
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Resource type filteri (avtomatik folder müəyyən edir: image→images, video→videos, raw→pdfs)',
    example: 'image',
    enum: ['image', 'video', 'raw'],
    default: 'image',
  })
  @IsOptional()
  @IsString()
  @IsIn(['image', 'video', 'raw'])
  resourceType?: 'image' | 'video' | 'raw' = 'image';

  @ApiPropertyOptional({
    description: 'Folder filteri (optional - resourceType-dan avtomatik müəyyən olunur)',
    example: 'images',
    enum: ['images', 'pdfs', 'videos'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['images', 'pdfs', 'videos'])
  folder?: 'images' | 'pdfs' | 'videos';
}


import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsNumber, IsIn, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductQueryDto {
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
    description: 'Hər səhifədə məhsul sayı',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə ölçüsü rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə ölçüsü 1-dən kiçik ola bilməz' })
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Kateqoriya ID-si ilə filterlə',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Kateqoriya ID-si rəqəm olmalıdır' })
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Aktiv məhsulları filterlə',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Məhsul adı və ya təsvirində axtarış (bütün dillərdə)',
    example: 'samsung',
  })
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @ApiPropertyOptional({
    description: 'Sıralama növü',
    example: 'az',
    enum: ['az', 'za', 'newest', 'oldest', 'most-viewed'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['az', 'za', 'newest', 'oldest', 'most-viewed'])
  sort?: 'az' | 'za' | 'newest' | 'oldest' | 'most-viewed';
}

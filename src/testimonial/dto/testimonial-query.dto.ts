import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TestimonialQueryDto {
  @ApiPropertyOptional({
    description: 'Aktiv testimonialları filterlə',
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
    description: 'Müştəri adı və ya rəyində axtarış (bütün dillərdə)',
    example: 'əli',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Axtarış dili (müəyyən dildə axtarış üçün)',
    example: 'az',
    enum: ['az', 'en', 'ru'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['az', 'en', 'ru'])
  lang?: 'az' | 'en' | 'ru';

  @ApiPropertyOptional({
    description: 'Sıralama növü',
    example: 'newest',
    enum: ['newest', 'oldest', 'name-az', 'name-za'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest', 'name-az', 'name-za'])
  sort?: 'newest' | 'oldest' | 'name-az' | 'name-za';

  @ApiPropertyOptional({
    description: 'Səhifə nömrəsi (1-dən başlayır)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Səhifə başına elementlərin sayı',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

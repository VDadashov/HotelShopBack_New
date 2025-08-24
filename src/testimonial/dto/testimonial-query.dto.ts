import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

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
}

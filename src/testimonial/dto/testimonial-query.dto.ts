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
    description: 'Reytinq filteri (minimum reytinq)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'MinRating rəqəm olmalıdır' })
  @Min(1, { message: 'MinRating ən azı 1 olmalıdır' })
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Sıralama növü',
    example: 'newest',
    enum: ['newest', 'oldest', 'name-az', 'name-za', 'rating-high', 'rating-low'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest', 'name-az', 'name-za', 'rating-high', 'rating-low'])
  sort?: 'newest' | 'oldest' | 'name-az' | 'name-za' | 'rating-high' | 'rating-low';

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
    description: 'Hər səhifədə element sayı',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə ölçüsü rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə ölçüsü 1-dən kiçik ola bilməz' })
  pageSize?: number = 10;
}

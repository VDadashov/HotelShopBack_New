import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsNumber, IsIn, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PromoQueryDto {
  @ApiPropertyOptional({
    description: 'Aktiv promoları filterlə',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Məhsul ID-si ilə filterlə',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Məhsul ID-si rəqəm olmalıdır' })
  productId?: number;

  @ApiPropertyOptional({
    description: 'Promo başlıq və ya təsvirində axtarış (bütün dillərdə)',
    example: 'yay',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Hazırda aktiv olan promoları filterlə',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  current?: boolean;

  @ApiPropertyOptional({
    description: 'Müəyyən tarixdən sonrakı promoları filterlə',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Müəyyən tarixə qədər başlayan promoları filterlə',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Sıralama növü',
    example: 'newest',
    enum: ['newest', 'oldest', 'start-date-asc', 'start-date-desc', 'end-date-asc', 'end-date-desc', 'title-az', 'title-za'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['newest', 'oldest', 'start-date-asc', 'start-date-desc', 'end-date-asc', 'end-date-desc', 'title-az', 'title-za'])
  sort?: 'newest' | 'oldest' | 'start-date-asc' | 'start-date-desc' | 'end-date-asc' | 'end-date-desc' | 'title-az' | 'title-za';
}

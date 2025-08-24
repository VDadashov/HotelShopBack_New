import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsObject, ValidateNested, IsNotEmpty, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Yay Promosiyası',
  })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn',
    example: 'Summer Promotion',
  })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Летняя акция',
  })
  @IsString()
  @IsNotEmpty()
  ru: string;
}

class MultilingualTextOptionalDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Böyük endirim!',
  })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiPropertyOptional({
    description: 'İngilis dilində mətn',
    example: 'Big discount!',
  })
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional({
    description: 'Rus dilində mətn',
    example: 'Большая скидка!',
  })
  @IsOptional()
  @IsString()
  ru?: string;
}

export class CreatePromoDto {
  @ApiProperty({
    description: 'Promo başlığı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Yay Promosiyası',
      en: 'Summer Promotion',
      ru: 'Летняя акция'
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  title: MultilingualTextDto;

  @ApiPropertyOptional({
    description: 'Promo alt başlığı (çoxdilli)',
    type: MultilingualTextOptionalDto,
    example: {
      az: 'Böyük endirim!',
      en: 'Big discount!',
      ru: 'Большая скидка!'
    }
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextOptionalDto)
  subtitle?: MultilingualTextOptionalDto;

  @ApiPropertyOptional({
    description: 'Promo təsviri (çoxdilli)',
    type: MultilingualTextOptionalDto,
    example: {
      az: 'Bu yay böyük endirimlər...',
      en: 'This summer great discounts...',
      ru: 'Этим летом большие скидки...'
    }
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextOptionalDto)
  description?: MultilingualTextOptionalDto;

  @ApiProperty({
    description: 'Promo başlama tarixi (ISO format)',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Başlama tarixi düzgün format olmalıdır (ISO)' })
  startDate: string;

  @ApiProperty({
    description: 'Promo bitmə tarixi (ISO format)',
    example: '2024-08-31T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'Bitmə tarixi düzgün format olmalıdır (ISO)' })
  endDate: string;

  @ApiProperty({
    description: 'Məhsul ID-si',
    example: 1,
  })
  @IsNumber({}, { message: 'Məhsul ID-si rəqəm olmalıdır' })
  productId: number;

  @ApiPropertyOptional({
    description: 'Promo arxa plan şəkli',
    example: '/uploads/promos/summer-promo.jpg',
  })
  @IsOptional()
  @IsString()
  backgroundImg?: string;

  @ApiPropertyOptional({
    description: 'Promo aktiv statusu',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive boolean olmalıdır' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean = true;
}

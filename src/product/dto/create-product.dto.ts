import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Samsung Galaxy S21',
  })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn',
    example: 'Samsung Galaxy S21',
  })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Самсунг Галакси S21',
  })
  @IsString()
  @IsNotEmpty()
  ru: string;
}

class MultilingualTextOptionalDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Bu məhsul haqqında ətraflı məlumat...',
  })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiPropertyOptional({
    description: 'İngilis dilində mətn',
    example: 'Detailed information about this product...',
  })
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional({
    description: 'Rus dilində mətn',
    example: 'Подробная информация об этом продукте...',
  })
  @IsOptional()
  @IsString()
  ru?: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Məhsul adı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Samsung Galaxy S21',
      en: 'Samsung Galaxy S21',
      ru: 'Самсунг Галакси S21'
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  name: MultilingualTextDto;

  @ApiPropertyOptional({
    description: 'Məhsul təsviri (çoxdilli)',
    type: MultilingualTextOptionalDto,
    example: {
      az: 'Bu məhsul haqqında ətraflı məlumat...',
      en: 'Detailed information about this product...',
      ru: 'Подробная информация об этом продукте...'
    }
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextOptionalDto)
  description?: MultilingualTextOptionalDto;

  @ApiProperty({
    description: 'Kateqoriya ID-si',
    example: 1,
  })
  @IsNumber({}, { message: 'Kateqoriya ID-si rəqəm olmalıdır' })
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Məhsulun əsas şəkli',
    example: '/uploads/products/samsung-s21.jpg',
  })
  @IsOptional()
  @IsString()
  mainImg?: string;

  @ApiPropertyOptional({
    description: 'Məhsulun aktiv statusu',
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

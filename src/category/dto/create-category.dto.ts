// src/dto/category/create-category.dto.ts
import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, IsUrl, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Multilingual text DTO
export class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Elektronika'
  })
  @IsString()
  @IsNotEmpty()
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn', 
    example: 'Electronics'
  })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Электроника'
  })
  @IsString()
  @IsNotEmpty()
  ru: string;
}

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Kateqoriya adı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Elektronika',
      en: 'Electronics', 
      ru: 'Электроника'
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  name: MultilingualTextDto;

  @ApiPropertyOptional({
    description: 'Kateqoriya şəkli URL-si',
    example: 'https://example.com/image.jpg'
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Kateqoriya aktiv statusu',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Bu kateqoriya məhsul saxlaya bilərmi',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isProductHolder?: boolean;

  @ApiPropertyOptional({
    description: 'Parent kateqoriya ID-si',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}

// src/brand/dto/create-brand.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BrandNameDto {
  @ApiProperty({
    description: 'Brand adı Azərbaycan dilində',
    example: 'Samsung',
  })
  @IsNotEmpty()
  @IsString()
  az: string;

  @ApiPropertyOptional({
    description: 'Brand adı İngilis dilində',
    example: 'Samsung',
  })
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional({
    description: 'Brand adı Rus dilində',
    example: 'Самсунг',
  })
  @IsOptional()
  @IsString()
  ru?: string;
}

export class CreateBrandDto {
  @ApiProperty({
    description: 'Brand adı müxtəlif dillərdə',
    type: BrandNameDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BrandNameDto)
  name: BrandNameDto;

  @ApiPropertyOptional({
    description: 'Brand şəkli URL-i',
    example: 'https://example.com/samsung-logo.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Brand aktiv statusu',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

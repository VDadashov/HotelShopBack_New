import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  MinLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Əli Məmmədov',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  az: string;

  @ApiPropertyOptional({
    description: 'İngilis dilində mətn',
    example: 'Ali Mammadov',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  en?: string;

  @ApiPropertyOptional({
    description: 'Rus dilində mətn',
    example: 'Али Мамедов',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  ru?: string;
}

class MessageMultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Bu xidmət çox yaxşıdır...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  az: string;

  @ApiPropertyOptional({
    description: 'İngilis dilində mətn',
    example: 'This service is very good...',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  en?: string;

  @ApiPropertyOptional({
    description: 'Rus dilində mətn',
    example: 'Эта услуга очень хорошая...',
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  ru?: string;
}

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Müştəri adı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Əli Məmmədov',
      en: 'Ali Mammadov',
      ru: 'Али Мамедов',
    },
  })
  @ValidateNested() // Bu sequence vacibdir!
  @Type(() => MultilingualTextDto)
  @IsObject()
  name: MultilingualTextDto;

  @ApiProperty({
    description: 'Müştəri rəyi (çoxdilli)',
    type: MessageMultilingualTextDto,
    example: {
      az: 'Bu xidmət çox yaxşıdır və həmişə keyfiyyətlidir...',
      en: 'This service is very good and always of high quality...',
      ru: 'Эта услуга очень хорошая и всегда качественная...',
    },
  })
  @ValidateNested() // Bu sequence vacibdir!
  @Type(() => MessageMultilingualTextDto)
  @IsObject()
  message: MessageMultilingualTextDto;

  @ApiPropertyOptional({
    description: 'Müştəri şəkli URL-i',
    example: '/uploads/testimonials/customer-photo.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Testimonial aktiv statusu',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Müştəri reytinqi (1-5 arası)',
    example: 5,
    minimum: 1,
    maximum: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  rating?: number = 5;
}

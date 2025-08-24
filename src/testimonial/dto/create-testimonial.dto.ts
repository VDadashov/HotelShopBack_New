import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, ValidateNested, IsNotEmpty, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Əli Məmmədov',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Mətn ən azı 2 simvol olmalıdır' })
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn',
    example: 'Ali Mammadov',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Mətn ən azı 2 simvol olmalıdır' })
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Али Мамедов',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Mətn ən azı 2 simvol olmalıdır' })
  ru: string;
}

class MessageMultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Bu xidmət çox yaxşıdır...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Mesaj ən azı 5 simvol olmalıdır' })
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn',
    example: 'This service is very good...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Mesaj ən azı 5 simvol olmalıdır' })
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Эта услуга очень хорошая...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Mesaj ən azı 5 simvol olmalıdır' })
  ru: string;
}

export class CreateTestimonialDto {
  @ApiProperty({
    description: 'Müştəri adı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Əli Məmmədov',
      en: 'Ali Mammadov',
      ru: 'Али Мамедов'
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  name: MultilingualTextDto;

  @ApiProperty({
    description: 'Müştəri rəyi (çoxdilli)',
    type: MessageMultilingualTextDto,
    example: {
      az: 'Bu xidmət çox yaxşıdır və həmişə keyfiyyətlidir...',
      en: 'This service is very good and always of high quality...',
      ru: 'Эта услуга очень хорошая и всегда качественная...'
    }
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MessageMultilingualTextDto)
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
  @IsBoolean({ message: 'isActive boolean olmalıdır' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean = true;
}

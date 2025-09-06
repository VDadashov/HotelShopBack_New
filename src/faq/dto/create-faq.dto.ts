import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  IsObject,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class MultilingualTextDto {
  @ApiProperty({
    description: 'Azərbaycan dilində mətn',
    example: 'Sifarişi necə verə bilərəm?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Mətn ən azı 3 simvol olmalıdır' })
  az: string;

  @ApiProperty({
    description: 'İngilis dilində mətn',
    example: 'How can I place an order?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Mətn ən azı 3 simvol olmalıdır' })
  en: string;

  @ApiProperty({
    description: 'Rus dilində mətn',
    example: 'Как я могу сделать заказ?',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Mətn ən azı 3 simvol olmalıdır' })
  ru: string;
}

export class CreateFaqDto {
  @ApiProperty({
    description: 'FAQ sualı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Sifarişi necə verə bilərəm?',
      en: 'How can I place an order?',
      ru: 'Как я могу сделать заказ?',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  question: MultilingualTextDto;

  @ApiProperty({
    description: 'FAQ cavabı (çoxdilli)',
    type: MultilingualTextDto,
    example: {
      az: 'Sifariş vermək üçün sayta daxil olub məhsulu seçməlisiniz...',
      en: 'To place an order, you need to log in to the site and select the product...',
      ru: 'Чтобы сделать заказ, вам нужно войти на сайт и выбрать товар...',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MultilingualTextDto)
  answer: MultilingualTextDto;

  @ApiProperty({
    description: 'FAQ-ın aktiv olub-olmaması',
    example: true,
    required: false,
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

// dto/create-page.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

// Multi-language title interface
export class MultiLanguageTitle {
  @ApiProperty({
    description: 'Title in Azerbaijani',
    example: 'Ana Səhifə',
  })
  @IsNotEmpty()
  az: string;

  @ApiProperty({
    description: 'Title in English',
    example: 'Home Page',
    required: false,
  })
  @IsOptional()
  en?: string;

  @ApiProperty({
    description: 'Title in Russian',
    example: 'Главная страница',
    required: false,
  })
  @IsOptional()
  ru?: string;
}

export class CreatePageDto {
  @ApiProperty({
    description: 'Page title in multiple languages',
    type: MultiLanguageTitle,
    example: {
      az: 'Ana Səhifə',
      en: 'Home Page',
      ru: 'Главная страница',
    },
  })
  @IsNotEmpty()
  title: MultiLanguageTitle;

  @ApiProperty({
    description: 'Whether the page is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

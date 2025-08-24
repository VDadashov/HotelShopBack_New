import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MultiLanguageText,
  MediaFile,
  AdditionalData,
} from '../../_common/classes/common-types';

export class CreateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: [
      'hero',
      'content',
      'about',
      'services',
      'gallery',
      'contact',
      'footer',
      'navbar',
      'testimonial',
      'blog',
      'custom',
    ],
  })
  @IsString()
  @IsIn([
    'hero',
    'content',
    'about',
    'services',
    'gallery',
    'contact',
    'footer',
    'navbar',
    'testimonial',
    'blog',
    'custom',
  ])
  type:
    | 'hero'
    | 'content'
    | 'about'
    | 'services'
    | 'gallery'
    | 'contact'
    | 'footer'
    | 'navbar'
    | 'testimonial'
    | 'blog'
    | 'custom';

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLanguageText)
  title: MultiLanguageText;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => MultiLanguageText)
  description: MultiLanguageText;

  @ApiProperty()
  @IsNumber()
  pageId: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number = 0;

  @ApiPropertyOptional({ enum: ['desktop', 'mobile', 'both'], default: 'both' })
  @IsOptional()
  @IsString()
  @IsIn(['desktop', 'mobile', 'both'])
  visibility?: 'desktop' | 'mobile' | 'both' = 'both';

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  // Media field - nullable
  @ApiPropertyOptional({ nullable: true, default: null })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaFile)
  media?: MediaFile | null = null;

  // AdditionalData field - nullable
  @ApiPropertyOptional({ nullable: true, default: null })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalData)
  additionalData?: AdditionalData | null = null;
}

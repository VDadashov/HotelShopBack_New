import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MultiLanguageText {
  @ApiProperty() @IsString() @IsNotEmpty() az: string;
  @ApiProperty() @IsString() @IsNotEmpty() en: string;
  @ApiProperty() @IsString() @IsNotEmpty() ru: string;

  constructor(partial?: Partial<MultiLanguageText>) {
    Object.assign(this, partial);
  }
}

// MediaFile class-ına da constructor əlavə edin
export class MediaFile {
  @ApiProperty() @IsString() @IsNotEmpty() url: string;
  @ApiProperty({ enum: ['image', 'video'] })
  @IsString()
  @IsIn(['image', 'video'])
  type: 'image' | 'video';
  @ApiPropertyOptional() @IsOptional() @IsNumber() size?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() mimeType?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => MultiLanguageText)
  alt?: MultiLanguageText;

  constructor(partial?: Partial<MediaFile>) {
    Object.assign(this, partial);
  }
}

export class AdditionalData {
  
  constructor(partial?: Partial<AdditionalData>) {
    Object.assign(this, partial);
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class FaqQueryDto {
  @ApiPropertyOptional({
    description: 'Aktiv FAQ-ları filterlə',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sual və ya cavabda axtarış (bütün dillərdə)',
    example: 'sifariş',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Axtarış dili (müəyyən dildə axtarış üçün)',
    example: 'az',
    enum: ['az', 'en', 'ru'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['az', 'en', 'ru'])
  lang?: 'az' | 'en' | 'ru';
}

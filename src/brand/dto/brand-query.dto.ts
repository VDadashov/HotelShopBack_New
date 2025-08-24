import { IsOptional, IsBoolean, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BrandQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Səhifə nömrəsi',
    example: 1,
    minimum: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Səhifədə göstəriləcək element sayı',
    example: 10,
    minimum: 1,
  })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Aktiv statusuna görə filtr',
    example: true,
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Brand adında axtarış',
    example: 'Samsung',
  })
  search?: string;
}

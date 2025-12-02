import { IsOptional, IsNumber, IsBoolean, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Səhifə nömrəsi',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə nömrəsi rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə nömrəsi 1-dən kiçik ola bilməz' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Hər səhifədə element sayı',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Səhifə ölçüsü rəqəm olmalıdır' })
  @Min(1, { message: 'Səhifə ölçüsü 1-dən kiçik ola bilməz' })
  pageSize?: number = 10;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === true || value === false) return value;
    return undefined; // undefined olarsa filter tətbiq olunmayacaq
  })
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'ParentId rəqəm olmalıdır' })
  @Min(0, { message: 'ParentId ən azı 0 olmalıdır' })
  parentId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'Level rəqəm olmalıdır' })
  @Min(1, { message: 'Level ən azı 1 olmalıdır' })
  level?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

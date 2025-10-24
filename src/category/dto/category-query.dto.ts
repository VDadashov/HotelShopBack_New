import { IsOptional, IsNumber, IsBoolean, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CategoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

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

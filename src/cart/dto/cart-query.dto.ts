import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CartQueryDto {
  @ApiProperty({
    description: 'Səbət tokeni',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Token string olmalıdır' })
  @IsUUID(4, { message: 'Token düzgün UUID format olmalıdır' })
  token: string;

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
    description: 'Hər səhifədə məhsul sayı',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit rəqəm olmalıdır' })
  @Min(1, { message: 'Limit 1-dən kiçik ola bilməz' })
  limit?: number = 10;
}

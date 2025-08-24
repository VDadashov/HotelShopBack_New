import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({
    description: 'Məhsul ID-si',
    example: 1,
  })
  @IsNumber({}, { message: 'Məhsul ID-si rəqəm olmalıdır' })
  id: number;

  @ApiProperty({
    description: 'Məhsul sayı',
    example: 2,
  })
  @IsNumber({}, { message: 'Məhsul sayı rəqəm olmalıdır' })
  quantity: number;
}

export class CreateCartDto {
  @ApiProperty({
    description: 'Səbətdəki məhsullar',
    type: [CartItemDto],
    example: [
      { id: 1, quantity: 2 },
      { id: 3, quantity: 1 }
    ]
  })
  @IsArray({ message: 'Items array olmalıdır' })
  @ArrayMinSize(1, { message: 'Ən azı bir məhsul olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

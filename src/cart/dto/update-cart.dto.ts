import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsUUID } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({
    description: 'Səbət tokeni',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Token string olmalıdır' })
  @IsUUID(4, { message: 'Token düzgün UUID format olmalıdır' })
  token: string;

  @ApiProperty({
    description: 'Səbətin təsdiqlənmiş statusu',
    example: true,
  })
  @IsBoolean({ message: 'isConfirmed boolean olmalıdır' })
  isConfirmed: boolean;
}

import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Yüklənəcək şəkil faylı' })
  file: any;
} 
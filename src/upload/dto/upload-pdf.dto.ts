import { ApiProperty } from '@nestjs/swagger';

export class UploadPdfDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Yüklənəcək PDF faylı' })
  file: any;
} 
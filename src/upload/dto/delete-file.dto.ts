import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export enum ResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw',
}

export class DeleteFileDto {
  @ApiProperty({
    description: 'Cloudinary public ID',
    example: 'hotelshop/images/1764608698070-364854808',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
    default: ResourceType.IMAGE,
    required: false,
  })
  @IsEnum(ResourceType)
  resourceType?: ResourceType = ResourceType.IMAGE;
}


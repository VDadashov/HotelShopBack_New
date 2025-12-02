import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { configureCloudinary } from '../config/cloudinary.config';

export interface UploadResult {
  media: {
    alt: {
      az: string;
      en: string;
      ru: string;
    };
    url: string;
    publicId: string;
    size: number;
    type: 'image' | 'video' | 'file';
    mimeType: string;
  };
}

@Injectable()
export class UploadService {
  private cloudinaryInstance: typeof cloudinary;

  constructor(private configService: ConfigService) {
    this.cloudinaryInstance = configureCloudinary(this.configService);
  }

  async saveFile(file: Express.Multer.File, folder: 'images' | 'pdfs' | 'videos'): Promise<UploadResult> {
    return new Promise<UploadResult>((resolve, reject) => {
      const uploadOptions: any = {
        folder: `hotelshop/${folder}`,
        resource_type: folder === 'videos' ? 'video' : 'auto',
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      };

      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error('Upload failed: No result returned'));
          } else {
            resolve({
              media: {
                alt: {
                  az: file.originalname,
                  en: file.originalname,
                  ru: file.originalname,
                },
                url: result.secure_url,
                publicId: result.public_id,
                size: file.size,
                type:
                  folder === 'videos'
                    ? 'video'
                    : folder === 'images'
                      ? 'image'
                      : 'file',
                mimeType: file.mimetype,
              },
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    try {
      const result = await this.cloudinaryInstance.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllFiles(query: {
    page?: number;
    pageSize?: number;
    folder?: 'images' | 'pdfs' | 'videos';
    resourceType?: 'image' | 'video' | 'raw';
  }) {
    try {
      const page = query.page || 1;
      const pageSize = query.pageSize || 10;
      const resourceType = query.resourceType || 'image';

      // ResourceType-dan folder müəyyən et (əgər folder verilməyibsə)
      let folder = query.folder;
      if (!folder) {
        switch (resourceType) {
          case 'image':
            folder = 'images';
            break;
          case 'video':
            folder = 'videos';
            break;
          case 'raw':
            folder = 'pdfs';
            break;
        }
      }

      // Cloudinary API-dən bütün faylları gətir
      const options: any = {
        type: 'upload',
        resource_type: resourceType,
        max_results: 500, // Cloudinary maksimum limit
        prefix: `hotelshop/${folder}`,
      };

      const result = await this.cloudinaryInstance.api.resources(options);

      // Bütün faylları map et
      const files = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        createdAt: resource.created_at,
        folder: resource.folder,
        resourceType: resource.resource_type,
        filename: resource.public_id.split('/').pop() || resource.public_id,
      }));

      // Pagination
      const totalItems = files.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const offset = (page - 1) * pageSize;
      const paginatedFiles = files.slice(offset, offset + pageSize);

      return {
        data: paginatedFiles,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

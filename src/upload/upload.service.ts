import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  saveFile(file: Express.Multer.File, folder: 'images' | 'pdfs' | 'videos') {
    const uploadPath = join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/${folder}/${file.filename}`;

    return {
      media: {
        alt: {
          az: file.originalname,
          en: file.originalname,
          ru: file.originalname,
        },
        url: fileUrl,
        size: file.size,
        type:
          folder === 'videos'
            ? 'video'
            : folder === 'images'
              ? 'image'
              : 'file',
        mimeType: file.mimetype,
      },
    };
  }
}

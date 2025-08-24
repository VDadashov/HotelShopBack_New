import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../_common/entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    private readonly i18n: I18nService,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const page = this.pageRepo.create(createPageDto);

    page.slug =
      createPageDto.title && createPageDto.title.az
        ? this.slugify(createPageDto.title.az)
        : '';

    return await this.pageRepo.save(page);
  }

  async findAll(lang?: string) {
    lang = lang || 'az';
    const pages = await this.pageRepo.find({
      where: { isActive: true },
      order: { id: 'DESC' },
    });

    return pages.map((page) => ({
      id: page.id,
      title: this.getTranslatedField(page.title, lang),
      slug: page.slug,
      isActive: page.isActive,
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const page = await this.pageRepo.findOne({
      where: { id, isActive: true },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return {
      id: page.id,
      title: this.getTranslatedField(page.title, lang),
      slug: page.slug,
      isActive: page.isActive,
    };
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepo.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    // Title update edilərsə, mövcud title ilə merge et
    if (updatePageDto.title) {
      page.title = {
        ...page.title,
        ...updatePageDto.title,
      };
    }

    // Yalnız isActive field-ini yenilə (slug dəyişilməz)
    if (updatePageDto.isActive !== undefined) {
      page.isActive = updatePageDto.isActive;
    }

    return await this.pageRepo.save(page);
  }

  async remove(id: number) {
    const page = await this.pageRepo.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    await this.pageRepo.remove(page);
    return { deleted: true, message: 'Page successfully deleted' };
  }

  // Admin üçün bütün səhifələri əldə et (bütün dillər daxil)
  async findAllForAdmin() {
    const pages = await this.pageRepo.find({
      order: { id: 'DESC' },
    });

    return pages.map((page) => ({
      id: page.id,
      title: page.title, // Bütün dillər
      slug: page.slug,
      isActive: page.isActive,
      // Title-ın hər dili ayrıca göstər
      titleAz: page.title?.az || '',
      titleEn: page.title?.en || '',
      titleRu: page.title?.ru || '',
    }));
  }

  // Admin üçün müəyyən səhifəni əldə et
  async findOneForAdmin(id: number) {
    const page = await this.pageRepo.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return {
      id: page.id,
      title: page.title, // Bütün dillər
      slug: page.slug,
      isActive: page.isActive,
      // Title-ın hər dili ayrıca göstər
      titleAz: page.title?.az || '',
      titleEn: page.title?.en || '',
      titleRu: page.title?.ru || '',
    };
  }

  async checkTitleExists(
    title: string,
    lang: string,
    excludeId?: number,
  ): Promise<boolean> {
    const queryBuilder = this.pageRepo.createQueryBuilder('page');

    // JSON field-də search
    queryBuilder.where(`page.title ->> :lang = :title`, {
      lang,
      title,
    });

    if (excludeId) {
      queryBuilder.andWhere('page.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  // Helper method - Dil üzrə field əldə et
  private getTranslatedField(
    field: { az: string; en?: string; ru?: string },
    lang: string,
  ): string {
    if (!field) return '';

    // Switch case ilə type-safe
    switch (lang) {
      case 'az':
        return field.az || '';
      case 'en':
        return field.en || field.az || '';
      case 'ru':
        return field.ru || field.az || '';
      default:
        return field.az || '';
    }
  }

  // Bütün dillərdə title update et
  async updateTitle(
    id: number,
    titleData: { az?: string; en?: string; ru?: string },
  ): Promise<Page> {
    const page = await this.pageRepo.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    // Mövcud title ilə merge et
    page.title = {
      ...page.title,
      ...titleData,
    };

    return await this.pageRepo.save(page);
  }

  // Slug generate et title əsasında (sizin product kimi)
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9əıöüçğş\s-]/g, '') // Azərbaycan hərfləri də daxil
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''); // Başlanğıc və son tire-ləri sil
  }
}

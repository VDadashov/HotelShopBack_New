import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../_common/entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Page } from 'src/_common/entities/page.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  // 🔹 Yeni Section yaratmaq
  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    try {
      // Page mövcudluğunu yoxla
      const page = await this.pageRepository.findOne({
        where: { id: createSectionDto.pageId },
      });

      if (!page) {
        throw new NotFoundException('Göstərilən page tapılmadı');
      }

      // Order avtomatik hesabla (əgər verilməyibsə)
      if (createSectionDto.order === undefined) {
        const lastSection = await this.sectionRepository.findOne({
          where: { pageId: createSectionDto.pageId },
          order: { order: 'DESC' },
        });

        createSectionDto.order = lastSection ? lastSection.order + 1 : 0;
      }

      // Media və additionalData null handling
      const sectionData = {
        ...createSectionDto,
        media: createSectionDto.media || null,
        additionalData: createSectionDto.additionalData || null,
      };

      const section = this.sectionRepository.create(sectionData);
      const savedSection = await this.sectionRepository.save(section);

      return savedSection;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Validation error-ları daha dəqiq göstər
      if (
        error.name === 'ValidationError' ||
        error.response?.statusCode === 400
      ) {
        throw new BadRequestException({
          message:
            error.response?.message || error.message || 'Validation failed',
          details: error.response?.details || null,
        });
      }

      throw new BadRequestException('Section yaradılarkən xəta baş verdi');
    }
  }

  // 🔹 Bütün Section-ları gətirmək (filters il

  // Alternative approach: Return only the selected language content
  // Alternative approach: Return only the selected language content
  async findAllWithSelectedLanguage(
    pageId?: number,
    type?: string,
    acceptLanguage: string = 'az',
  ): Promise<any[]> {
    // Changed return type to any[] instead of Partial<Section>[]
    try {
      const where: any = { isActive: true };

      if (pageId) {
        where.pageId = pageId;
      }

      if (type) {
        where.type = type;
      }

      const sections = await this.sectionRepository.find({
        where,
        order: { order: 'ASC', createdAt: 'DESC' },
      });

      // Return sections with only the selected language content
      const filteredSections = sections.map((section) => ({
        id: section.id,
        name: section.name,
        type: section.type,
        order: section.order,
        pageId: section.pageId,
        isActive: section.isActive,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        title: section.title?.[acceptLanguage] || '',
        description: section.description?.[acceptLanguage] || '',
        media: section.media
          ? {
              ...section.media,
              alt: section.media.alt?.[acceptLanguage] || '',
            }
          : section.media,
        additionalData: section.additionalData
          ? this.filterAdditionalDataForLanguage(
              section.additionalData,
              acceptLanguage,
            )
          : section.additionalData,
      }));

      return filteredSections;
    } catch (error) {
      throw error;
    }
  }

  private filterAdditionalDataForLanguage(
    additionalData: any,
    language: string,
  ): any {
    const filtered = { ...additionalData };

    Object.keys(filtered).forEach((key) => {
      if (
        filtered[key] &&
        typeof filtered[key] === 'object' &&
        filtered[key].hasOwnProperty(language)
      ) {
        filtered[key] = filtered[key][language];
      }
    });

    return filtered;
  }

  // 🔹 Admin üçün bütün section-ları gətirmək
  async findAllForAdmin(): Promise<Section[]> {
    try {
      const sections = await this.sectionRepository.find({
        order: { order: 'ASC', createdAt: 'DESC' },
      });
      return sections;
    } catch (error) {
      throw error;
    }
  }

  // 🔹 ID ilə tapmaq
  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
    return section;
  }

  // 🔹 Yeniləmək
  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const section = await this.findOne(id);
    Object.assign(section, updateSectionDto);
    return await this.sectionRepository.save(section);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sectionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Section with id ${id} not found`);
    }
  }
}

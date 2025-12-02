import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Testimonial } from '../_common/entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
    private readonly i18n: I18nService,
  ) {}

  // Yeni testimonial yaratmaq
  async create(
    createTestimonialDto: CreateTestimonialDto,
  ): Promise<Testimonial> {
    const testimonial = this.testimonialRepository.create({
      name: createTestimonialDto.name,
      message: createTestimonialDto.message,
      imageUrl: createTestimonialDto.imageUrl,
      isActive: createTestimonialDto.isActive ?? true,
      rating: createTestimonialDto.rating ?? 5,
    });

    return await this.testimonialRepository.save(testimonial);
  }

  // Bütün testimonialları əldə etmək (filtrsiz) - lang dəstəyi ilə
  async getAll(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const testimonials = await this.testimonialRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return testimonials.map((testimonial) => ({
      ...testimonial,
      name: this.i18n.translateField(testimonial.name, lang),
      message: this.i18n.translateField(testimonial.message, lang),
    }));
  }

  // Admin üçün bütün testimonialları əldə etmək (tərcüməsiz)
  async getAllForAdmin(): Promise<Testimonial[]> {
    return await this.testimonialRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  // Filtrlər və paginasiya ilə testimonialları əldə etmək - lang dəstəyi ilə
  async findAll(
    queryDto: TestimonialQueryDto = {},
    lang?: string,
  ): Promise<{
    data: any[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }> {
    lang = lang || 'az';
    const {
      page = 1,
      pageSize = 10,
      isActive,
      search,
      minRating,
      sort = 'newest',
    } = queryDto;

    const skip = (page - 1) * pageSize;

    const queryBuilder =
      this.testimonialRepository.createQueryBuilder('testimonial');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('testimonial.isActive = :isActive', { isActive });
    }

    // Reytinq filteri
    if (minRating !== undefined) {
      queryBuilder.andWhere('testimonial.rating >= :minRating', { minRating });
    }

    // PostgreSQL JSONB axtarışı
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      
      // Bütün dillərdə axtarış
      queryBuilder.andWhere(
        `(
          LOWER(testimonial.name->>'az') LIKE LOWER(:search) OR 
          LOWER(testimonial.name->>'en') LIKE LOWER(:search) OR 
          LOWER(testimonial.name->>'ru') LIKE LOWER(:search) OR
          LOWER(testimonial.message->>'az') LIKE LOWER(:search) OR 
          LOWER(testimonial.message->>'en') LIKE LOWER(:search) OR 
          LOWER(testimonial.message->>'ru') LIKE LOWER(:search)
        )`,
        { search: searchTerm },
      );
    }

    // Sıralama
    switch (sort) {
      case 'newest':
        queryBuilder.orderBy('testimonial.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('testimonial.createdAt', 'ASC');
        break;
      case 'name-az':
        queryBuilder.orderBy("testimonial.name->>'az'", 'ASC');
        break;
      case 'name-za':
        queryBuilder.orderBy("testimonial.name->>'az'", 'DESC');
        break;
      case 'rating-high':
        queryBuilder.orderBy('testimonial.rating', 'DESC');
        break;
      case 'rating-low':
        queryBuilder.orderBy('testimonial.rating', 'ASC');
        break;
      default:
        queryBuilder.orderBy('testimonial.id', 'DESC');
    }

    // Paginasiya
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Tərcümə et
    const translatedData = data.map((testimonial) => ({
      ...testimonial,
      name: this.i18n.translateField(testimonial.name, lang),
      message: this.i18n.translateField(testimonial.message, lang),
    }));

    return {
      data: translatedData,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  // Admin üçün findAll (tərcüməsiz)
  async findAllForAdmin(queryDto: TestimonialQueryDto = {}): Promise<{
    data: Testimonial[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  }> {
    const {
      page = 1,
      pageSize = 10,
      isActive,
      search,
      minRating,
      sort = 'newest',
    } = queryDto;

    const skip = (page - 1) * pageSize;

    const queryBuilder =
      this.testimonialRepository.createQueryBuilder('testimonial');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('testimonial.isActive = :isActive', { isActive });
    }

    // Reytinq filteri
    if (minRating !== undefined) {
      queryBuilder.andWhere('testimonial.rating >= :minRating', { minRating });
    }

    // Axtarış (JSON sahəsində axtarış)
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      
      queryBuilder.andWhere(
        `(
          LOWER(testimonial.name->>'az') LIKE LOWER(:search) OR 
          LOWER(testimonial.name->>'en') LIKE LOWER(:search) OR 
          LOWER(testimonial.name->>'ru') LIKE LOWER(:search) OR
          LOWER(testimonial.message->>'az') LIKE LOWER(:search) OR 
          LOWER(testimonial.message->>'en') LIKE LOWER(:search) OR 
          LOWER(testimonial.message->>'ru') LIKE LOWER(:search)
        )`,
        { search: searchTerm },
      );
    }

    // Sıralama
    switch (sort) {
      case 'newest':
        queryBuilder.orderBy('testimonial.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('testimonial.createdAt', 'ASC');
        break;
      case 'name-az':
        queryBuilder.orderBy("testimonial.name->>'az'", 'ASC');
        break;
      case 'name-za':
        queryBuilder.orderBy("testimonial.name->>'az'", 'DESC');
        break;
      case 'rating-high':
        queryBuilder.orderBy('testimonial.rating', 'DESC');
        break;
      case 'rating-low':
        queryBuilder.orderBy('testimonial.rating', 'ASC');
        break;
      default:
        queryBuilder.orderBy('testimonial.id', 'DESC');
    }

    // Paginasiya
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  async findOne(id: number, lang?: string): Promise<any> {
    lang = lang || 'az';
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException(`ID ${id} olan testimonial tapılmadı`);
    }

    return {
      ...testimonial,
      name: this.i18n.translateField(testimonial.name, lang),
      message: this.i18n.translateField(testimonial.message, lang),
    };
  }

  // Admin üçün findOne (tərcüməsiz)
  async findOneForAdmin(id: number): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException(`ID ${id} olan testimonial tapılmadı`);
    }

    return testimonial;
  }

  // Testimonialı yeniləmək
  async update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonial> {
    const testimonial = await this.findOneForAdmin(id);

    Object.assign(testimonial, updateTestimonialDto);
    return await this.testimonialRepository.save(testimonial);
  }

  // Testimonialı silmək
  async remove(id: number): Promise<void> {
    const testimonial = await this.findOneForAdmin(id);
    await this.testimonialRepository.remove(testimonial);
  }

  // Aktiv testimonialları əldə etmək - lang dəstəyi ilə
  async getActiveTestimonials(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const testimonials = await this.testimonialRepository.find({
      where: { isActive: true },
      order: { id: 'DESC' },
    });

    return testimonials.map((testimonial) => ({
      ...testimonial,
      name: this.i18n.translateField(testimonial.name, lang),
      message: this.i18n.translateField(testimonial.message, lang),
    }));
  }

  // Admin üçün aktiv testimoniallar (tərcüməsiz)
  async getActiveTestimonialsForAdmin(): Promise<Testimonial[]> {
    return await this.testimonialRepository.find({
      where: { isActive: true },
      order: { id: 'DESC' },
    });
  }
}

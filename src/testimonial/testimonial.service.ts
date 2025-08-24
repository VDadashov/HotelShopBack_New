import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from '../_common/entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialQueryDto } from './dto/testimonial-query.dto';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async findAll(query: TestimonialQueryDto): Promise<Testimonial[]> {
    const queryBuilder = this.testimonialRepository.createQueryBuilder('testimonial');

    // Aktiv status filtri
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('testimonial.isActive = :isActive', { 
        isActive: query.isActive 
      });
    }

    // Multilingual axtarış
    if (query.search) {
      if (query.lang) {
        // Müəyyən dildə axtarış
        queryBuilder.andWhere(
          `(testimonial.name ->> :lang ILIKE :search OR testimonial.message ->> :lang ILIKE :search)`,
          { 
            lang: query.lang, 
            search: `%${query.search}%` 
          }
        );
      } else {
        // Bütün dillərdə axtarış
        queryBuilder.andWhere(
          `(testimonial.name ->> 'az' ILIKE :search OR 
            testimonial.name ->> 'en' ILIKE :search OR 
            testimonial.name ->> 'ru' ILIKE :search OR
            testimonial.message ->> 'az' ILIKE :search OR 
            testimonial.message ->> 'en' ILIKE :search OR 
            testimonial.message ->> 'ru' ILIKE :search)`,
          { search: `%${query.search}%` }
        );
      }
    }

    // Sıralama
    switch (query.sort) {
      case 'newest':
        queryBuilder.orderBy('testimonial.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('testimonial.createdAt', 'ASC');
        break;
      case 'name-az':
        queryBuilder.orderBy("testimonial.name ->> 'az'", 'ASC');
        break;
      case 'name-za':
        queryBuilder.orderBy("testimonial.name ->> 'az'", 'DESC');
        break;
      default:
        queryBuilder.orderBy('testimonial.id', 'DESC');
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({ 
      where: { id } 
    });

    if (!testimonial) {
      throw new NotFoundException('Testimonial tapılmadı');
    }

    return testimonial;
  }

  async create(createTestimonialDto: CreateTestimonialDto): Promise<Testimonial> {
    const testimonial = this.testimonialRepository.create(createTestimonialDto);
    return await this.testimonialRepository.save(testimonial);
  }

  async update(id: number, updateTestimonialDto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    
    Object.assign(testimonial, updateTestimonialDto);
    return await this.testimonialRepository.save(testimonial);
  }

  async remove(id: number): Promise<{ message: string }> {
    const testimonial = await this.findOne(id);
    
    await this.testimonialRepository.remove(testimonial);
    return { message: 'Testimonial uğurla silindi' };
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await this.testimonialRepository.find({
      where: { isActive: true },
      order: { id: 'DESC' },
    });
  }
}

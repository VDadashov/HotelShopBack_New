import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../_common/entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async findAll(query: FaqQueryDto): Promise<Faq[]> {
    const queryBuilder = this.faqRepository.createQueryBuilder('faq');

    // Aktiv FAQ-ları filtrele
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('faq.isActive = :isActive', { 
        isActive: query.isActive 
      });
    }

    // Multilingual axtarış funksiyası
    if (query.search) {
      if (query.lang) {
        // Müəyyən dildə axtarış
        queryBuilder.andWhere(
          `(faq.question ->> :lang ILIKE :search OR faq.answer ->> :lang ILIKE :search)`,
          { 
            lang: query.lang, 
            search: `%${query.search}%` 
          }
        );
      } else {
        // Bütün dillərdə axtarış
        queryBuilder.andWhere(
          `(faq.question ->> 'az' ILIKE :search OR 
            faq.question ->> 'en' ILIKE :search OR 
            faq.question ->> 'ru' ILIKE :search OR
            faq.answer ->> 'az' ILIKE :search OR 
            faq.answer ->> 'en' ILIKE :search OR 
            faq.answer ->> 'ru' ILIKE :search)`,
          { search: `%${query.search}%` }
        );
      }
    }

    return await queryBuilder
      .orderBy('faq.id', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    
    if (!faq) {
      throw new NotFoundException('FAQ tapılmadı');
    }
    
    return faq;
  }

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqRepository.create(createFaqDto);
    return await this.faqRepository.save(faq);
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    
    Object.assign(faq, updateFaqDto);
    return await this.faqRepository.save(faq);
  }

  async remove(id: number): Promise<{ message: string }> {
    const faq = await this.findOne(id);
    
    await this.faqRepository.remove(faq);
    return { message: 'FAQ uğurla silindi' };
  }
}

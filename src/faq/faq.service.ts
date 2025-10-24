import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Faq } from '../_common/entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqQueryDto } from './dto/faq-query.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
    private readonly i18n: I18nService,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    // Faq entity-ni doğru şəkildə yaradın
    const faq = new Faq();
    faq.question = createFaqDto.question as any; // MultilingualTextDto-nu JSON olaraq saxlayırıq
    faq.answer = createFaqDto.answer as any; // MultilingualTextDto-nu JSON olaraq saxlayırıq
    faq.isActive = createFaqDto.isActive ?? true;

    return await this.faqRepository.save(faq);
  }

  async getAll(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const faqs = await this.faqRepository.find({
      where: { isActive: true },
      order: {
        id: 'DESC',
      },
    });

    return faqs.map((faq) => ({
      ...faq,
      question: this.i18n.translateField(faq.question, lang),
      answer: this.i18n.translateField(faq.answer, lang),
    }));
  }

  async getAllForAdmin(): Promise<Faq[]> {
    return await this.faqRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findAll(
    queryDto: FaqQueryDto = {},
    lang?: string,
    isActive?: boolean,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    lang = lang || 'az';

    const page = (queryDto as any).page || 1;
    const limit = (queryDto as any).limit || 10;
    const { search, lang: searchLang } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.faqRepository.createQueryBuilder('faq');

    if (isActive !== undefined) {
      queryBuilder.andWhere('faq.isActive = :isActive', { isActive });
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;

      if (searchLang) {
        queryBuilder.andWhere(
          `(
          LOWER(faq.question->>'${searchLang}') LIKE LOWER(:search) OR 
          LOWER(faq.answer->>'${searchLang}') LIKE LOWER(:search)
        )`,
          { search: searchTerm },
        );
      } else {
        queryBuilder.andWhere(
          `(
          LOWER(faq.question->>'az') LIKE LOWER(:search) OR 
          LOWER(faq.question->>'en') LIKE LOWER(:search) OR 
          LOWER(faq.question->>'ru') LIKE LOWER(:search) OR
          LOWER(faq.answer->>'az') LIKE LOWER(:search) OR 
          LOWER(faq.answer->>'en') LIKE LOWER(:search) OR 
          LOWER(faq.answer->>'ru') LIKE LOWER(:search)
        )`,
          { search: searchTerm },
        );
      }
    }

    queryBuilder.addOrderBy('faq.id', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const translatedData = data.map((faq) => ({
      ...faq,
      question: this.i18n.translateField(faq.question, lang),
      answer: this.i18n.translateField(faq.answer, lang),
    }));

    return {
      data: translatedData,
      total,
      page,
      limit,
    };
  }

  async findAllForAdmin(queryDto: FaqQueryDto = {}): Promise<{
    data: Faq[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Default dəyərlər təyin edin
    const page = (queryDto as any).page || 1;
    const limit = (queryDto as any).limit || 10;
    const { isActive, search, lang: searchLang } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.faqRepository.createQueryBuilder('faq');

    if (isActive !== undefined) {
      queryBuilder.andWhere('faq.isActive = :isActive', { isActive });
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;

      if (searchLang) {
        queryBuilder.andWhere(
          `(
            LOWER(faq.question->>'${searchLang}') LIKE LOWER(:search) OR 
            LOWER(faq.answer->>'${searchLang}') LIKE LOWER(:search)
          )`,
          { search: searchTerm },
        );
      } else {
        queryBuilder.andWhere(
          `(
            LOWER(faq.question->>'az') LIKE LOWER(:search) OR 
            LOWER(faq.question->>'en') LIKE LOWER(:search) OR 
            LOWER(faq.question->>'ru') LIKE LOWER(:search) OR
            LOWER(faq.answer->>'az') LIKE LOWER(:search) OR 
            LOWER(faq.answer->>'en') LIKE LOWER(:search) OR 
            LOWER(faq.answer->>'ru') LIKE LOWER(:search)
          )`,
          { search: searchTerm },
        );
      }
    }

    queryBuilder.addOrderBy('faq.id', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, lang?: string): Promise<any> {
    lang = lang || 'az';
    const faq = await this.faqRepository.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`ID ${id} olan FAQ tapılmadı`);
    }

    return {
      ...faq,
      question: this.i18n.translateField(faq.question, lang),
      answer: this.i18n.translateField(faq.answer, lang),
    };
  }

  async findOneForAdmin(id: number): Promise<Faq> {
    const faq = await this.faqRepository.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`ID ${id} olan FAQ tapılmadı`);
    }

    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOneForAdmin(id);

    Object.assign(faq, updateFaqDto);
    return await this.faqRepository.save(faq);
  }

  async remove(id: number): Promise<void> {
    const faq = await this.findOneForAdmin(id);
    await this.faqRepository.remove(faq);
  }
}

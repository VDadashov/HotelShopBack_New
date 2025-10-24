import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promo } from '../_common/entities/promo.entity';
import { Product } from '../_common/entities/product.entity';
import { CreatePromoDto } from './dto/create-promo.dto';
import { UpdatePromoDto } from './dto/update-promo.dto';
import { PromoQueryDto } from './dto/promo-query.dto';

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(Promo)
    private readonly promoRepository: Repository<Promo>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private resolveImage(promo: Promo): string | null {
    if (promo.backgroundImg) {
      return promo.backgroundImg;
    }
    if (promo.product && promo.product.mainImg) {
      return promo.product.mainImg;
    }
    return null;
  }

  async findAll(query: PromoQueryDto): Promise<Promo[]> {
    const queryBuilder = this.promoRepository.createQueryBuilder('promo')
      .leftJoinAndSelect('promo.product', 'product');

    // Aktiv status filtri
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('promo.isActive = :isActive', { isActive: query.isActive });
    }

    // Məhsul ID filtri
    if (query.productId) {
      queryBuilder.andWhere('promo.productId = :productId', { productId: query.productId });
    }

    // Hazırda aktiv olan promoları filterlə
    if (query.current) {
      const now = new Date();
      queryBuilder.andWhere('promo.startDate <= :now AND promo.endDate >= :now', { now });
    }

    // Tarix filtriləri
    if (query.startDateFrom) {
      queryBuilder.andWhere('promo.startDate >= :startDateFrom', { 
        startDateFrom: new Date(query.startDateFrom) 
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('promo.startDate <= :startDateTo', { 
        startDateTo: new Date(query.startDateTo) 
      });
    }

    // Multilingual axtarış
    if (query.search && query.search.trim() !== '') {
      const searchTerm = `%${query.search.trim().toLowerCase()}%`;
      
      // Bütün dillərdə axtarış
      queryBuilder.andWhere(
        `(
          LOWER(promo.title->>'az') LIKE LOWER(:search) OR 
          LOWER(promo.title->>'en') LIKE LOWER(:search) OR 
          LOWER(promo.title->>'ru') LIKE LOWER(:search) OR
          LOWER(promo.subtitle->>'az') LIKE LOWER(:search) OR 
          LOWER(promo.subtitle->>'en') LIKE LOWER(:search) OR 
          LOWER(promo.subtitle->>'ru') LIKE LOWER(:search) OR
          LOWER(promo.description->>'az') LIKE LOWER(:search) OR 
          LOWER(promo.description->>'en') LIKE LOWER(:search) OR 
          LOWER(promo.description->>'ru') LIKE LOWER(:search)
        )`,
        { search: searchTerm }
      );
    }

    // Sıralama
    switch (query.sort) {
      case 'newest':
        queryBuilder.orderBy('promo.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('promo.createdAt', 'ASC');
        break;
      case 'start-date-asc':
        queryBuilder.orderBy('promo.startDate', 'ASC');
        break;
      case 'start-date-desc':
        queryBuilder.orderBy('promo.startDate', 'DESC');
        break;
      case 'end-date-asc':
        queryBuilder.orderBy('promo.endDate', 'ASC');
        break;
      case 'end-date-desc':
        queryBuilder.orderBy('promo.endDate', 'DESC');
        break;
      case 'title-az':
        queryBuilder.orderBy("promo.title->>'az'", 'ASC');
        break;
      case 'title-za':
        queryBuilder.orderBy("promo.title->>'az'", 'DESC');
        break;
      default:
        queryBuilder.orderBy('promo.startDate', 'DESC');
    }

    const promos = await queryBuilder.getMany();

    // Her promo üçün backgroundImg resolve et
    return promos.map(promo => ({
      ...promo,
      backgroundImg: this.resolveImage(promo),
    }));
  }

  async findOne(id: number): Promise<Promo> {
    const promo = await this.promoRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!promo) {
      throw new NotFoundException('Promo tapılmadı');
    }

    // backgroundImg resolve et
    return {
      ...promo,
      backgroundImg: this.resolveImage(promo),
    };
  }

  async create(createPromoDto: CreatePromoDto): Promise<Promo> {
    // Tarixi validasiya et
    const startDate = new Date(createPromoDto.startDate);
    const endDate = new Date(createPromoDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Bitmə tarixi başlama tarixindən sonra olmalıdır');
    }

    // Məhsulun mövcudluğunu yoxla
    const product = await this.productRepository.findOne({
      where: { id: createPromoDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    const promo = this.promoRepository.create({
      ...createPromoDto,
      startDate,
      endDate,
      product,
    });

    const savedPromo = await this.promoRepository.save(promo);
    
    // Relation ilə geri qaytar və image resolve et
    const promoWithProduct = await this.findOne(savedPromo.id);
    return promoWithProduct;
  }

  async update(id: number, updatePromoDto: UpdatePromoDto): Promise<Promo> {
    const promo = await this.promoRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!promo) {
      throw new NotFoundException('Promo tapılmadı');
    }

    // Tarixi validasiya et (əgər dəyişdirilirsə)
    if (updatePromoDto.startDate || updatePromoDto.endDate) {
      const startDate = updatePromoDto.startDate ? new Date(updatePromoDto.startDate) : promo.startDate;
      const endDate = updatePromoDto.endDate ? new Date(updatePromoDto.endDate) : promo.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Bitmə tarixi başlama tarixindən sonra olmalıdır');
      }

      if (updatePromoDto.startDate) {
        promo.startDate = startDate;
      }
      if (updatePromoDto.endDate) {
        promo.endDate = endDate;
      }
    }

    // Məhsul dəyişdirilirsə, mövcudluğunu yoxla
    if (updatePromoDto.productId && updatePromoDto.productId !== promo.product.id) {
      const product = await this.productRepository.findOne({
        where: { id: updatePromoDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Məhsul tapılmadı');
      }

      promo.product = product;
    }

    // Digər fieldləri yenilə
    Object.assign(promo, updatePromoDto);
    
    const savedPromo = await this.promoRepository.save(promo);
    
    // Image resolve et
    return {
      ...savedPromo,
      backgroundImg: this.resolveImage(savedPromo),
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    const promo = await this.promoRepository.findOne({ where: { id } });
    
    if (!promo) {
      throw new NotFoundException('Promo tapılmadı');
    }
    
    await this.promoRepository.remove(promo);
    return { message: 'Promo uğurla silindi' };
  }

  async getCurrentPromos(): Promise<Promo[]> {
    const now = new Date();
    
    const queryBuilder = this.promoRepository.createQueryBuilder('promo')
      .leftJoinAndSelect('promo.product', 'product')
      .where('promo.isActive = :isActive', { isActive: true })
      .andWhere('promo.startDate <= :now', { now })
      .andWhere('promo.endDate >= :now', { now })
      .orderBy('promo.startDate', 'DESC');

    const promos = await queryBuilder.getMany();

    // Her promo üçün backgroundImg resolve et
    return promos.map(promo => ({
      ...promo,
      backgroundImg: this.resolveImage(promo),
    }));
  }
}

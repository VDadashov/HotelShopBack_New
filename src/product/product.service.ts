import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../_common/entities/product.entity';
import { Category } from '../_common/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { I18nService } from '../i18n/i18n.service';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly i18n: I18nService,
  ) {}

  async findAll(query: ProductQueryDto, acceptLanguage?: string): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 10, categoryId, isActive, searchQuery, sort } = query;
    const offset = (page - 1) * pageSize;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Kateqoriya filtri
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Aktiv status filtri
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    // Multilingual axtarış
    if (searchQuery) {
      if (acceptLanguage) {
        // Müəyyən dildə axtarış
        queryBuilder.andWhere(
          `(product.name ->> :lang ILIKE :search OR product.description ->> :lang ILIKE :search)`,
          { lang: acceptLanguage, search: `%${searchQuery}%` }
        );
      } else {
        // Bütün dillərdə axtarış
        queryBuilder.andWhere(
          `(product.name ->> 'az' ILIKE :search OR 
            product.name ->> 'en' ILIKE :search OR 
            product.name ->> 'ru' ILIKE :search OR
            product.description ->> 'az' ILIKE :search OR 
            product.description ->> 'en' ILIKE :search OR 
            product.description ->> 'ru' ILIKE :search)`,
          { search: `%${searchQuery}%` }
        );
      }
    }

    // Sıralama
    switch (sort) {
      case 'az':
        // A-Z sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'ASC');
        break;
      case 'za':
        // Z-A sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      case 'most-viewed':
        queryBuilder.orderBy('product.views', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.id', 'DESC');
    }

    // Ümumi sayı tapaq
    const totalItems = await queryBuilder.getCount();

    // Səhifələmə ilə məhsulları gətir
    const products = await queryBuilder
      .skip(offset)
      .take(pageSize)
      .getMany();

    return {
      data: products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  async findAllForAdmin(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const { page = 1, pageSize = 10, categoryId, isActive, searchQuery, sort } = query;
    const offset = (page - 1) * pageSize;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Kateqoriya filtri
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Aktiv status filtri
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    // Multilingual axtarış (admin üçün bütün dillərdə)
    if (searchQuery) {
      queryBuilder.andWhere(
        `(product.name ->> 'az' ILIKE :search OR 
          product.name ->> 'en' ILIKE :search OR 
          product.name ->> 'ru' ILIKE :search OR
          product.description ->> 'az' ILIKE :search OR 
          product.description ->> 'en' ILIKE :search OR 
          product.description ->> 'ru' ILIKE :search)`,
        { search: `%${searchQuery}%` }
      );
    }

    // Sıralama (admin üçün)
    switch (sort) {
      case 'az':
        // A-Z sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'ASC');
        break;
      case 'za':
        // Z-A sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      case 'most-viewed':
        queryBuilder.orderBy('product.views', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.id', 'DESC');
    }

    // Ümumi sayı tapaq
    const totalItems = await queryBuilder.getCount();

    // Səhifələmə ilə məhsulları gətir
    const products = await queryBuilder
      .skip(offset)
      .take(pageSize)
      .getMany();

    return {
      data: products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  async findOne(id: number, acceptLanguage?: string): Promise<any> {
    const lang = acceptLanguage || 'az';
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    return {
      ...product,
      name: this.i18n.translateField(product.name, lang),
      description: this.i18n.translateField(product.description, lang),
      category: product.category ? {  // ✅ Null yoxlaması
        ...product.category,
        name: this.i18n.translateField(product.category.name, lang),
      } : null,  // ✅ Category yoxdursa null qaytar
    };
  }

  async findOneForAdmin(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Kateqoriyanın mövcudluğunu yoxla
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kateqoriya tapılmadı');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });

    return await this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    // ✅ Əgər categoryId dəyişdirilirsə
    if (updateProductDto.categoryId !== undefined) {
      // Mövcud category-nin id-si (null ola bilər)
      const currentCategoryId = product.category?.id || null;

      // Yalnız fərqli categoryId-dirsə yoxla
      if (updateProductDto.categoryId !== currentCategoryId) {
        const category = await this.categoryRepository.findOne({
          where: { 
            id: updateProductDto.categoryId,
          },
        });

        if (!category) {
          throw new NotFoundException('Kateqoriya tapılmadı və ya silinib');
        }

        product.category = category;
      }
      
      // categoryId-ni DTO-dan sil
      delete updateProductDto.categoryId;
    }

    Object.assign(product, updateProductDto);
    const updated = await this.productRepository.save(product);
    
    // ✅ Formatlanmış response qaytar
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    
    await this.productRepository.remove(product);
    return { message: 'Məhsul uğurla silindi' };
  }

  async incrementViews(id: number): Promise<{ message: string; views: number }> {
    const product = await this.findOne(id);
    
    product.views += 1;
    await this.productRepository.save(product);
    
    return {
      message: 'Baxış sayı artırıldı',
      views: product.views,
    };
  }
}

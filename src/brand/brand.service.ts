// src/brand/brand.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Brand } from '../_common/entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly i18n: I18nService,
  ) {}

  // Yeni brand yaratmaq
  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    // JSON sahəsində axtarış üçün query builder istifadə et - PostgreSQL sintaksisi
    const existingBrandCheck = await this.brandRepository
      .createQueryBuilder('brand')
      .where("brand.name->>'az' = :name", { name: createBrandDto.name.az })
      .getOne();

    if (existingBrandCheck) {
      throw new BadRequestException('Bu adda brand artıq mövcuddur');
    }

    const brand = this.brandRepository.create({
      name: createBrandDto.name,
      imageUrl: createBrandDto.imageUrl,
      isActive: createBrandDto.isActive ?? true,
    });

    return await this.brandRepository.save(brand);
  }

  // Bütün brandları əldə etmək (filtrsiz) - lang dəstəyi ilə
  async getAll(lang?: string, isActive?: boolean): Promise<any[]> {
    lang = lang || 'az';
    const whereCondition: any = {};
    
    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    const brands = await this.brandRepository.find({
      where: whereCondition,
      order: {
        id: 'ASC',
      },
    });

    return brands.map((brand) => ({
      ...brand,
      name: this.i18n.translateField(brand.name, lang),
    }));
  }

  // Admin üçün bütün brandları əldə etmək (tərcüməsiz)
  async getAllForAdmin(isActive?: boolean): Promise<Brand[]> {
    const whereCondition: any = {};
    
    if (isActive !== undefined) {
      whereCondition.isActive = isActive;
    }

    return await this.brandRepository.find({
      where: whereCondition,
      order: {
        id: 'ASC',
      },
    });
  }

  // Paginasiya və filtrlər ilə brandları əldə etmək - lang dəstəyi ilə
  async findAll(
    queryDto: BrandQueryDto = {},
    lang?: string,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    lang = lang || 'az';
    const { page = 1, limit = 10, isActive, search } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.brandRepository.createQueryBuilder('brand');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('brand.isActive = :isActive', { isActive });
    }

    // Axtarış (PostgreSQL JSON sintaksisi)
    if (search) {
      queryBuilder.andWhere(
        "(brand.name->>'az' ILIKE :search OR brand.name->>'en' ILIKE :search OR brand.name->>'ru' ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    // Sıralama və paginasiya
    queryBuilder.orderBy('brand.id', 'ASC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Tərcümə et
    const translatedData = data.map((brand) => ({
      ...brand,
      name: this.i18n.translateField(brand.name, lang),
    }));

    return {
      data: translatedData,
      total,
      page,
      limit,
    };
  }

  // Admin üçün findAll (tərcüməsiz)
  async findAllForAdmin(queryDto: BrandQueryDto = {}): Promise<{
    data: Brand[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, isActive, search } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.brandRepository.createQueryBuilder('brand');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('brand.isActive = :isActive', { isActive });
    }

    // Axtarış (PostgreSQL JSON sintaksisi)
    if (search) {
      queryBuilder.andWhere(
        "(brand.name->>'az' ILIKE :search OR brand.name->>'en' ILIKE :search OR brand.name->>'ru' ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    // Sıralama və paginasiya
    queryBuilder.orderBy('brand.id', 'ASC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // Tək brand tapmaq - lang dəstəyi ilə
  async findOne(id: number, lang?: string): Promise<any> {
    lang = lang || 'az';
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!brand) {
      throw new NotFoundException(`ID ${id} olan brand tapılmadı`);
    }

    return {
      ...brand,
      name: this.i18n.translateField(brand.name, lang),
    };
  }

  // Admin üçün tək brand tapmaq (tərcüməsiz)
  async findOneForAdmin(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`ID ${id} olan brand tapılmadı`);
    }

    return brand;
  }

  // Brandı yeniləmək
  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOneForAdmin(id);

    // Əgər ad dəyişdirilisə, eyni adın olmamasını yoxla
    if (updateBrandDto.name && updateBrandDto.name.az !== brand.name.az) {
      const existingBrand = await this.brandRepository
        .createQueryBuilder('brand')
        .where("brand.name->>'az' = :name", { name: updateBrandDto.name.az })
        .andWhere('brand.id != :id', { id })
        .getOne();

      if (existingBrand) {
        throw new BadRequestException('Bu adda brand artıq mövcuddur');
      }
    }

    Object.assign(brand, updateBrandDto);
    return await this.brandRepository.save(brand);
  }

  // Brandı silmək
  async remove(id: number): Promise<void> {
    const brand = await this.findOneForAdmin(id);
    await this.brandRepository.remove(brand);
  }

  // Aktiv brandları əldə etmək - lang dəstəyi ilə
  async getActiveBrands(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const brands = await this.brandRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });

    return brands.map((brand) => ({
      ...brand,
      name: this.i18n.translateField(brand.name, lang),
    }));
  }

  // Admin üçün aktiv brandlar (tərcüməsiz)
  async getActiveBrandsForAdmin(): Promise<Brand[]> {
    return await this.brandRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  // Brand statusunu dəyişmək
  async toggleStatus(id: number): Promise<Brand> {
    const brand = await this.findOneForAdmin(id);
    brand.isActive = !brand.isActive;
    return await this.brandRepository.save(brand);
  }

  // Brand adına görə axtarış - lang dəstəyi ilə
  async searchByName(name: string, lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const brands = await this.brandRepository
      .createQueryBuilder('brand')
      .where(
        "(brand.name->>'az' ILIKE :search OR brand.name->>'en' ILIKE :search OR brand.name->>'ru' ILIKE :search)",
        { search: `%${name}%` },
      )
      .andWhere('brand.isActive = :isActive', { isActive: true })
      .orderBy('brand.id', 'ASC')
      .getMany();

    return brands.map((brand) => ({
      ...brand,
      name: this.i18n.translateField(brand.name, lang),
    }));
  }

  // Admin üçün ad ilə axtarış (tərcüməsiz)
  async searchByNameForAdmin(name: string): Promise<Brand[]> {
    return await this.brandRepository
      .createQueryBuilder('brand')
      .where(
        "(brand.name->>'az' ILIKE :search OR brand.name->>'en' ILIKE :search OR brand.name->>'ru' ILIKE :search)",
        { search: `%${name}%` },
      )
      .orderBy('brand.id', 'ASC')
      .getMany();
  }

  // Statistikalar (admin üçün)
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      this.brandRepository.count(),
      this.brandRepository.count({ where: { isActive: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}

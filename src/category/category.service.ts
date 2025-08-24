// src/category/category.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Like, FindManyOptions } from 'typeorm';
import { Category } from '../_common/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly i18n: I18nService,
  ) {}

  // Yeni kateqoriya yaratmaq
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    let level = 1; // Default root səviyyə
    let parent: Category | null = null;

    // Əgər parentId varsa, parent-i yoxla və level hesabla
    if (createCategoryDto.parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent kateqoriya tapılmadı');
      }

      if (!parent.isActive) {
        throw new BadRequestException(
          'Deaktiv kateqoriyanın alt kateqoriyası yaradıla bilməz',
        );
      }

      level = parent.level + 1;

      // Maximum səviyyə yoxlaması (məsələn, 5 səviyyə)
      if (level > 5) {
        throw new BadRequestException(
          'Maximum 5 səviyyə kateqoriya yaradıla bilər',
        );
      }
    }

    // Eyni adda kateqoriya var mı yoxla (eyni parent altında)
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        parentId: createCategoryDto.parentId || IsNull(),
      },
    });

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      imageUrl: createCategoryDto.imageUrl,
      isActive: createCategoryDto.isActive,
      isProductHolder: createCategoryDto.isProductHolder,
      parentId: createCategoryDto.parentId,
      level,
    });

    return await this.categoryRepository.save(category);
  }

  // Bütün kateqoriyaları əldə etmək (filtrsiz) - lang dəstəyi ilə
  async getAll(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const categories = await this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: {
        level: 'ASC',
        id: 'ASC',
      },
    });

    return categories.map((category) => ({
      ...category,
      name: this.i18n.translateField(category.name, lang),
      parent: category.parent
        ? {
            ...category.parent,
            name: this.i18n.translateField(category.parent.name, lang),
          }
        : null,
      children: category.children
        ? category.children.map((child) => ({
            ...child,
            name: this.i18n.translateField(child.name, lang),
          }))
        : [],
    }));
  }

  // Admin üçün bütün kateqoriyaları əldə etmək (tərcüməsiz)
  async getAllForAdmin(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: {
        level: 'ASC',
        id: 'ASC',
      },
    });
  }

  // CategoryService - lang dəstəyi ilə
  async findAll(
    queryDto: CategoryQueryDto = {},
    lang?: string,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    lang = lang || 'az';
    const {
      page = 1,
      limit = 10,
      isActive,
      parentId = undefined,
      level = undefined,
      search,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('category.parentId IS NULL');
      } else {
        queryBuilder.andWhere('category.parentId = :parentId', { parentId });
      }
    }

    if (level !== undefined) {
      queryBuilder.andWhere('category.level = :level', { level });
    }

    // Axtarış (JSON sahəsində axtarış)
    if (search) {
      queryBuilder.andWhere(
        '(category.name->>"$.az" LIKE :search OR category.name->>"$.en" LIKE :search OR category.name->>"$.ru" LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sıralama və paginasiya
    queryBuilder
      .orderBy('category.level', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Tərcümə et
    const translatedData = data.map((category) => ({
      ...category,
      name: this.i18n.translateField(category.name, lang),
      parent: category.parent
        ? {
            ...category.parent,
            name: this.i18n.translateField(category.parent.name, lang),
          }
        : null,
      children: category.children
        ? category.children.map((child) => ({
            ...child,
            name: this.i18n.translateField(child.name, lang),
          }))
        : [],
    }));

    return {
      data: translatedData,
      total,
      page,
      limit,
    };
  }

  // Admin üçün findAll (tərcüməsiz)
  async findAllForAdmin(queryDto: CategoryQueryDto = {}): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      isActive,
      parentId = undefined,
      level = undefined,
      search,
    } = queryDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children');

    // Filtrlər
    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('category.parentId IS NULL');
      } else {
        queryBuilder.andWhere('category.parentId = :parentId', { parentId });
      }
    }

    if (level !== undefined) {
      queryBuilder.andWhere('category.level = :level', { level });
    }

    // Axtarış (JSON sahəsində axtarış)
    if (search) {
      queryBuilder.andWhere(
        '(category.name->>"$.az" LIKE :search OR category.name->>"$.en" LIKE :search OR category.name->>"$.ru" LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sıralama və paginasiya
    queryBuilder
      .orderBy('category.level', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .skip(skip)
      .take(limit);

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
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`ID ${id} olan kateqoriya tapılmadı`);
    }

    return {
      ...category,
      name: this.i18n.translateField(category.name, lang),
      parent: category.parent
        ? {
            ...category.parent,
            name: this.i18n.translateField(category.parent.name, lang),
          }
        : null,
      children: category.children
        ? category.children.map((child) => ({
            ...child,
            name: this.i18n.translateField(child.name, lang),
          }))
        : [],
    };
  }

  // Admin üçün findOne (tərcüməsiz)
  async findOneForAdmin(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'products'],
    });

    if (!category) {
      throw new NotFoundException(`ID ${id} olan kateqoriya tapılmadı`);
    }

    return category;
  }

  // Kateqoriyanı yeniləmək
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOneForAdmin(id);
    let level = category.level;

    // Əgər parentId dəyişdirilisə, level-i yenidən hesabla
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId
    ) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Kateqoriya özünün parent-i ola bilməz');
      }

      if (updateCategoryDto.parentId) {
        const newParent = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId },
        });

        if (!newParent) {
          throw new NotFoundException('Yeni parent kateqoriya tapılmadı');
        }

        // Circular reference yoxlama (alt kateqoriyanı parent etmək)
        const isChildOfCurrent = await this.isChildOfCategory(
          id,
          updateCategoryDto.parentId,
        );
        if (isChildOfCurrent) {
          throw new BadRequestException(
            'Alt kateqoriyanı parent kimi təyin etmək mümkün deyil',
          );
        }

        level = newParent.level + 1;
      } else {
        level = 1; // Root səviyyə
      }

      // Alt kateqoriyaların level-ini də yenilə
      await this.updateChildrenLevels(id, level);
    }

    Object.assign(category, updateCategoryDto, { level });
    return await this.categoryRepository.save(category);
  }

  // Kateqoriyanı silmək
  async remove(id: number): Promise<void> {
    const category = await this.findOneForAdmin(id);

    // Alt kateqoriyalar var mı yoxla
    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Alt kateqoriyaları olan kateqoriya silinə bilməz',
      );
    }

    await this.categoryRepository.remove(category);
  }

  // Root kateqoriyaları əldə etmək - lang dəstəyi ilə
  async getRootCategories(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const categories = await this.categoryRepository.find({
      where: { level: 1, isActive: true },
      relations: ['children'],
      order: { id: 'ASC' },
    });

    return categories.map((category) => ({
      ...category,
      name: this.i18n.translateField(category.name, lang),
      children: category.children
        ? category.children.map((child) => ({
            ...child,
            name: this.i18n.translateField(child.name, lang),
          }))
        : [],
    }));
  }

  // Admin üçün root kateqoriyaları (tərcüməsiz)
  async getRootCategoriesForAdmin(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { level: 1, isActive: true },
      relations: ['children'],
      order: { id: 'ASC' },
    });
  }

  // Kateqoriya ağacını əldə etmək - lang dəstəyi ilə
  async getCategoryTree(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['children', 'parent'],
      order: { level: 'ASC', id: 'ASC' },
    });

    // Tərcümə et
    const translatedCategories = categories.map((category) => ({
      ...category,
      name: this.i18n.translateField(category.name, lang),
    }));

    return this.buildTree(translatedCategories);
  }

  // Admin üçün kateqoriya ağacı (tərcüməsiz)
  async getCategoryTreeForAdmin(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['children', 'parent'],
      order: { level: 'ASC', id: 'ASC' },
    });

    return this.buildTree(categories);
  }

  // Məhsul saxlaya bilən kateqoriyaları əldə etmək - lang dəstəyi ilə
  async getProductHolderCategories(lang?: string): Promise<any[]> {
    lang = lang || 'az';
    const categories = await this.categoryRepository.find({
      where: { isProductHolder: true, isActive: true },
      order: { level: 'ASC', id: 'ASC' },
    });

    return categories.map((category) => ({
      ...category,
      name: this.i18n.translateField(category.name, lang),
    }));
  }

  // Admin üçün məhsul saxlaya bilən kateqoriyalar (tərcüməsiz)
  async getProductHolderCategoriesForAdmin(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isProductHolder: true, isActive: true },
      order: { level: 'ASC', id: 'ASC' },
    });
  }

  // Helper: Alt kateqoriya yoxlaması
  private async isChildOfCategory(
    parentId: number,
    childId: number,
  ): Promise<boolean> {
    const child = await this.categoryRepository.findOne({
      where: { id: childId },
      relations: ['parent'],
    });

    if (!child || !child.parent) {
      return false;
    }

    if (child.parent.id === parentId) {
      return true;
    }

    return await this.isChildOfCategory(parentId, child.parent.id);
  }

  // Helper: Alt kateqoriyaların level-ini yeniləmək
  private async updateChildrenLevels(
    parentId: number,
    newParentLevel: number,
  ): Promise<void> {
    const children = await this.categoryRepository.find({
      where: { parentId },
    });

    for (const child of children) {
      child.level = newParentLevel + 1;
      await this.categoryRepository.save(child);

      // Rekursiv olaraq alt kateqoriyaları da yenilə
      await this.updateChildrenLevels(child.id, child.level);
    }
  }

  // Helper: Ağac strukturu qurmaq
  private buildTree(categories: any[], parentId: number | null = null): any[] {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: this.buildTree(categories, category.id),
      }));
  }
}

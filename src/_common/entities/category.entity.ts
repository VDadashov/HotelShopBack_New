import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from './_base/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: { az: string; en?: string; ru?: string };

  // 🔄 Şəkil silindi, əvəzində sıralama üçün index əlavə edildi
  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Sıralama üçün indeks (artan şəkildə göstəriləcək)',
  })
  index: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    nullable: false,
    default: false,
    comment: 'Bu kateqoriya məhsul saxlaya bilərmi',
  })
  isProductHolder: boolean;

  @Column({
    nullable: true,
    comment: 'Parent kateqoriya ID-si',
  })
  parentId: number;

  @Column({
    nullable: false,
    default: 1,
    comment: 'Kateqoriyanın səviyyəsi (1-root)',
  })
  level: number;

  // Self-referencing relations (parent-child)
  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  // Products relation
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

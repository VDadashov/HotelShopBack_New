import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { Category } from './category.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb', nullable: true })
  description: { az: string; en?: string; ru?: string };

  @Column({ type: 'integer', default: 0 })
  views: number;

  @Column({ nullable: true })
  mainImg: string;

  @ManyToOne(() => Category, (category) => category.products, { 
    nullable: true,  
    onDelete: 'SET NULL'
  })
  category: Category;

  @Column({ default: true })
  isActive: boolean;
}
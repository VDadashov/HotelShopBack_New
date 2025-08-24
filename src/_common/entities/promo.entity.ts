import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './_base/base.entity';
import { Product } from './product.entity';

@Entity('promos')
export class Promo extends BaseEntity {
  @Column({ type: 'jsonb' })
  title: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb', nullable: true })
  subtitle: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb', nullable: true })
  description: { az: string; en?: string; ru?: string };

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  backgroundImg: string | null;

  @ManyToOne(() => Product, { nullable: false })
  product: Product;

  @Column({ default: true })
  isActive: boolean;
}

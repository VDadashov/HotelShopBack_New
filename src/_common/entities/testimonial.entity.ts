// testimonial.entity.ts - FIXED
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('testimonials')
export class Testimonial extends BaseEntity {
  @Column({ type: 'jsonb' })
  name: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb' })
  message: { az: string; en?: string; ru?: string };

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 5 })
  rating: number;
}

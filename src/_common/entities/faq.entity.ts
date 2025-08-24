import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('faqs')
export class Faq extends BaseEntity {
  @Column({ type: 'jsonb' })
  question: { az: string; en?: string; ru?: string };

  @Column({ type: 'jsonb' })
  answer: { az: string; en?: string; ru?: string };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
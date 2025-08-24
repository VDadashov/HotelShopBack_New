import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from './page.entity';
import {
  MultiLanguageText,
  MediaFile,
  AdditionalData,
} from '../classes/common-types';

@Entity('sections')
export class Section extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'jsonb' })
  title: MultiLanguageText;

  @Column({ type: 'jsonb' })
  description: MultiLanguageText;

  @Column({ type: 'jsonb', nullable: true })
  media?: MediaFile | null;

  @Column({ type: 'jsonb', nullable: true })
  additionalData?: AdditionalData | null;

  @Column({ default: 0 })
  order: number;

  @Column({ length: 30, default: 'content' })
  type:
    | 'hero'
    | 'content'
    | 'about'
    | 'services'
    | 'gallery'
    | 'contact'
    | 'footer'
    | 'navbar'
    | 'testimonial'
    | 'blog'
    | 'custom';

  @Column({ name: 'page_id' })
  pageId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ length: 10, default: 'both' })
  visibility: 'desktop' | 'mobile' | 'both';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Page, (page) => page.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;
}

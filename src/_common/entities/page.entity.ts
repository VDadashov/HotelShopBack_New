// page.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Section } from './section.entity';

export interface MultiLanguageText {
  az: string;
  en?: string;
  ru?: string;
}

@Entity('pages')
export class Page extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column('json')
  title: MultiLanguageText;

  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Section, (section) => section.page, {
    cascade: true,
    eager: false, // Lazy loading - yalnız lazım olduqda yüklənir
  })
  sections: Section[];
}

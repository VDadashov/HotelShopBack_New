// src/_common/entities/brand.entity.ts
import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('brands')
export class Brand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb' })
  name: { az: string; en?: string; ru?: string };

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;
}

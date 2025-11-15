import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;
} 
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'admin' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;
} 
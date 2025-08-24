import { Entity, Column } from 'typeorm';
import { BaseEntity } from './_base/base.entity';

export interface CartItem {
  id: number;
  quantity: number;
}

@Entity('carts')
export class Cart extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'jsonb', default: [] })
  items: CartItem[];

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;
}

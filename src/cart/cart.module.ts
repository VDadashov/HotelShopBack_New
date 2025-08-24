import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from '../_common/entities/cart.entity';
import { Product } from '../_common/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

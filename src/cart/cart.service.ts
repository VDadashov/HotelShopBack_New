import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem } from '../_common/entities/cart.entity';
import { Product } from '../_common/entities/product.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartQueryDto } from './dto/cart-query.dto';

export interface CartItemWithProduct {
  id: number;
  quantity: number;
  product: Product | null;
}

export interface PaginatedCartItems {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: CartItemWithProduct[];
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCartItems(query: CartQueryDto): Promise<PaginatedCartItems> {
    const { token, page = 1, limit = 10 } = query;

    // Cart-ı tap
    const cart = await this.cartRepository.findOne({ where: { token } });
    if (!cart) {
      throw new NotFoundException('Səbət tapılmadı');
    }

    // Boş səbət yoxlanışı
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      return {
        page,
        limit,
        totalItems: 0,
        totalPages: 0,
        items: [],
      };
    }

    // Məhsul ID-lərini topla
    const itemIds = cart.items.map(item => item.id);

    // Məhsulları gətir
    const products = await this.productRepository.find({
      where: { id: In(itemIds) },
      select: ['id', 'name', 'mainImg', 'description'],
    });

    // Cart məlumatları ilə məhsul məlumatlarını birləşdir
    const cartDetails: CartItemWithProduct[] = cart.items.map(item => {
      const product = products.find(p => p.id === item.id);
      return {
        id: item.id,
        quantity: item.quantity,
        product: product || null,
      };
    });

    // Pagination tətbiq et
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = cartDetails.slice(startIndex, endIndex);

    return {
      page,
      limit,
      totalItems: cartDetails.length,
      totalPages: Math.ceil(cartDetails.length / limit),
      items: paginatedItems,
    };
  }

  async createCart(createCartDto: CreateCartDto): Promise<{ token: string }> {
    const { items } = createCartDto;

    // Məhsulların mövcudluğunu yoxla
    const productIds = items.map(item => item.id);
    const existingProducts = await this.productRepository.find({
      where: { id: In(productIds) },
      select: ['id'],
    });

    const existingProductIds = existingProducts.map(p => p.id);
    const missingProductIds = productIds.filter(id => !existingProductIds.includes(id));

    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Bu məhsullar tapılmadı: ${missingProductIds.join(', ')}`
      );
    }

    // Quantity-lərin düzgünlüyünü yoxla
    const invalidItems = items.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      throw new BadRequestException('Məhsul sayı 0-dan böyük olmalıdır');
    }

    // Token yaradıb Cart-ı saxla
    const token = uuidv4();
    const cart = this.cartRepository.create({
      token,
      items,
      isConfirmed: false,
    });

    await this.cartRepository.save(cart);
    return { token };
  }

  async updateCart(updateCartDto: UpdateCartDto): Promise<{ message: string }> {
    const { token, isConfirmed } = updateCartDto;

    // Cart-ı tap
    const cart = await this.cartRepository.findOne({ where: { token } });
    if (!cart) {
      throw new NotFoundException('Səbət tapılmadı');
    }

    // Status-u yenilə
    cart.isConfirmed = isConfirmed;
    await this.cartRepository.save(cart);

    return { message: 'Səbət statusu uğurla yeniləndi' };
  }

  async findCartByToken(token: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({ where: { token } });
    if (!cart) {
      throw new NotFoundException('Səbət tapılmadı');
    }
    return cart;
  }

  async deleteCart(token: string): Promise<{ message: string }> {
    const cart = await this.findCartByToken(token);
    await this.cartRepository.remove(cart);
    return { message: 'Səbət uğurla silindi' };
  }

  async addItemToCart(
    token: string, 
    productId: number, 
    quantity: number
  ): Promise<Cart> {
    const cart = await this.findCartByToken(token);

    // Məhsulun mövcudluğunu yoxla
    const product = await this.productRepository.findOne({ 
      where: { id: productId } 
    });
    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    if (quantity <= 0) {
      throw new BadRequestException('Məhsul sayı 0-dan böyük olmalıdır');
    }

    // Məhsul səbətdə varmı yoxla
    const existingItemIndex = cart.items.findIndex(item => item.id === productId);
    
    if (existingItemIndex > -1) {
      // Mövcud məhsulun sayını artır
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Yeni məhsul əlavə et
      cart.items.push({ id: productId, quantity });
    }

    return await this.cartRepository.save(cart);
  }

  async removeItemFromCart(token: string, productId: number): Promise<Cart> {
    const cart = await this.findCartByToken(token);

    // Məhsulu səbətdən sil
    cart.items = cart.items.filter(item => item.id !== productId);
    
    return await this.cartRepository.save(cart);
  }

  async updateItemQuantity(
    token: string, 
    productId: number, 
    quantity: number
  ): Promise<Cart> {
    const cart = await this.findCartByToken(token);

    if (quantity <= 0) {
      throw new BadRequestException('Məhsul sayı 0-dan böyük olmalıdır');
    }

    // Məhsulu tap və quantity-ni yenilə
    const itemIndex = cart.items.findIndex(item => item.id === productId);
    if (itemIndex === -1) {
      throw new NotFoundException('Məhsul səbətdə tapılmadı');
    }

    cart.items[itemIndex].quantity = quantity;
    
    return await this.cartRepository.save(cart);
  }
}

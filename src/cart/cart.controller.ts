import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartQueryDto } from './dto/cart-query.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('items')
  @ApiOperation({ 
    summary: 'Tokenə əsasən səbət məhsullarını səhifələmə ilə gətir' 
  })
  @ApiResponse({
    status: 200,
    description: 'Səhifələnmiş səbət məhsul siyahısı',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalItems: { type: 'number', example: 25 },
        totalPages: { type: 'number', example: 3 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              quantity: { type: 'number', example: 2 },
              product: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { 
                    type: 'object',
                    properties: {
                      az: { type: 'string', example: 'Samsung Galaxy S21' },
                      en: { type: 'string', example: 'Samsung Galaxy S21' },
                      ru: { type: 'string', example: 'Самсунг Галакси S21' },
                    }
                  },
                  mainImg: { type: 'string', example: '/uploads/samsung-s21.jpg' },
                  description: {
                    type: 'object',
                    properties: {
                      az: { type: 'string', example: 'Ən yeni smartfon...' },
                      en: { type: 'string', example: 'Latest smartphone...' },
                      ru: { type: 'string', example: 'Новейший смартфон...' },
                    }
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token tələb olunur',
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət tapılmadı',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    type: String,
    description: 'Səbət tokeni (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Səhifə nömrəsi',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Hər səhifədə məhsul sayı',
    example: 10,
  })
  async getCartItems(@Query() query: CartQueryDto) {
    return await this.cartService.getCartItems(query);
  }

  @Post('items')
  @ApiOperation({ summary: 'Yeni səbət yaradıb yalnız token qaytar' })
  @ApiBody({
    description: 'Səbət məhsulları',
    type: CreateCartDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Səbət yaradıldı və token qaytarıldı',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validasiya xətası və ya məhsul tapılmadı',
  })
  async createCart(@Body() createCartDto: CreateCartDto) {
    return await this.cartService.createCart(createCartDto);
  }

  @Patch('items')
  @ApiOperation({ summary: 'Səbət isConfirmed statusunu dəyiş' })
  @ApiBody({
    description: 'Səbət status yeniləməsi',
    type: UpdateCartDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Səbət statusu uğurla dəyişdirildi',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Səbət statusu uğurla yeniləndi',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət tapılmadı',
  })
  async updateCart(@Body() updateCartDto: UpdateCartDto) {
    return await this.cartService.updateCart(updateCartDto);
  }

  @Delete(':token')
  @ApiOperation({ summary: 'Səbəti sil' })
  @ApiParam({
    name: 'token',
    type: 'string',
    description: 'Səbət tokeni (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Səbət uğurla silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət tapılmadı',
  })
  async deleteCart(@Param('token') token: string) {
    return await this.cartService.deleteCart(token);
  }

  @Post(':token/items/:productId')
  @ApiOperation({ summary: 'Səbətə məhsul əlavə et' })
  @ApiParam({
    name: 'token',
    type: 'string',
    description: 'Səbət tokeni',
  })
  @ApiParam({
    name: 'productId',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          example: 1,
          description: 'Əlavə ediləcək məhsul sayı',
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul səbətə əlavə edildi',
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət və ya məhsul tapılmadı',
  })
  async addItemToCart(
    @Param('token') token: string,
    @Param('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return await this.cartService.addItemToCart(token, productId, quantity);
  }

  @Delete(':token/items/:productId')
  @ApiOperation({ summary: 'Səbətdən məhsul sil' })
  @ApiParam({
    name: 'token',
    type: 'string',
    description: 'Səbət tokeni',
  })
  @ApiParam({
    name: 'productId',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul səbətdən silindi',
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət tapılmadı',
  })
  async removeItemFromCart(
    @Param('token') token: string,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return await this.cartService.removeItemFromCart(token, productId);
  }

  @Patch(':token/items/:productId')
  @ApiOperation({ summary: 'Səbətdəki məhsul sayını yenilə' })
  @ApiParam({
    name: 'token',
    type: 'string',
    description: 'Səbət tokeni',
  })
  @ApiParam({
    name: 'productId',
    type: 'number',
    description: 'Məhsul ID-si',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          example: 3,
          description: 'Yeni məhsul sayı',
        },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Məhsul sayı yeniləndi',
  })
  @ApiResponse({
    status: 404,
    description: 'Səbət və ya məhsul tapılmadı',
  })
  async updateItemQuantity(
    @Param('token') token: string,
    @Param('productId', ParseIntPipe) productId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return await this.cartService.updateItemQuantity(token, productId, quantity);
  }
}

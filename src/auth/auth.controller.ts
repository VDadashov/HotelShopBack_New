import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 201, description: 'JWT access token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Admin qeydiyyatı' })
  @ApiResponse({ status: 201, description: 'Yeni admin yaradıldı' })
  register(@Body() dto: AdminRegisterDto) {
    return this.authService.register(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin profilini göstər' })
  @ApiResponse({ status: 200, description: 'Admin profili' })
  profile(@Req() req) {
    return this.authService.profile(req.user.id);
  }

  @Get('admin-protected')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Yalnız admin roluna açıq qorunan rota' })
  @ApiResponse({ status: 200, description: 'Admin üçün qorunan məlumat' })
  adminProtected() {
    return { message: 'Yalnız admin roluna açıq məlumat' };
  }

  @Post('create-test-admin')
  @ApiOperation({ summary: 'Test admin yaratmaq üçün' })
  @ApiResponse({ status: 201, description: 'Test admin yaradıldı' })
  async createTestAdmin() {
    const testAdminDto = {
      username: 'testadmin',
      email: 'test@admin.com',
      password: 'password123',
      role: 'admin'
    };
    return this.authService.register(testAdminDto);
  }
} 
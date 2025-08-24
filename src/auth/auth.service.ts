import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../_common/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, pass: string): Promise<Admin | null> {
    const admin = await this.adminRepo.findOneBy({ username });
    if (!admin || !admin.isActive) return null;
    const isMatch = await bcrypt.compare(pass, admin.password);
    return isMatch ? admin : null;
  }

  async login(dto: LoginDto) {
    const admin = await this.validateAdmin(dto.username, dto.password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const payload = { username: admin.username, sub: admin.id, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
      admin: { id: admin.id, username: admin.username, role: admin.role },
    };
  }

  async register(dto: AdminRegisterDto) {
    const exists = await this.adminRepo.findOne({
      where: [
        { username: dto.username },
        { email: dto.email }
      ]
    });
    if (exists) throw new BadRequestException('Admin already exists');
    const hash = await bcrypt.hash(dto.password, 10);
    const admin = this.adminRepo.create({ ...dto, password: hash });
    return this.adminRepo.save(admin);
  }

  async profile(adminId: number) {
    const admin = await this.adminRepo.findOneBy({ id: adminId });
    if (!admin) throw new UnauthorizedException('Admin not found');
    return { id: admin.id, username: admin.username, email: admin.email, role: admin.role, lastLogin: admin.lastLogin };
  }
} 
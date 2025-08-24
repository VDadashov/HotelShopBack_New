import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const admin = await this.adminRepo.findOneBy({ id: payload.sub });
    console.log('Found admin:', admin);
    if (!admin || !admin.isActive) {
      console.log('Admin not found or inactive:', { admin: !!admin, isActive: admin?.isActive });
      throw new UnauthorizedException('Invalid token');
    }
    return { id: admin.id, username: admin.username, role: admin.role };
  }
} 
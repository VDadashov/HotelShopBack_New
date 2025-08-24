import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeader(request);
    console.log('JwtAuthGuard - Token:', token ? 'Present' : 'Missing');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('JwtAuthGuard - Error:', err);
    console.log('JwtAuthGuard - User:', user);
    console.log('JwtAuthGuard - Info:', info);
    
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token');
    }
    return user;
  }

  private getTokenFromHeader(request: any): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) return null;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
} 
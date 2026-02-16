import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing basic auth');
    }

    const encoded = header.slice('Basic '.length).trim();
    let decoded = '';
    try {
      decoded = Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      throw new UnauthorizedException('Invalid basic auth');
    }

    const [username, password] = decoded.split(':');
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedUser || !expectedPass) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    if (username !== expectedUser || password !== expectedPass) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return true;
  }
}

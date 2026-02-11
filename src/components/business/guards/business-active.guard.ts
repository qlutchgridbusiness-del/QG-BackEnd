import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { BusinessStatus } from '../business-status.enum';

@Injectable()
export class BusinessActiveGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const business = req.business;

    if (!business || business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('Business pending admin approval');
    }

    return true;
  }
}

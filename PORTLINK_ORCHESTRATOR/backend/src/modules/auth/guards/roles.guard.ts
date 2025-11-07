import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user?.role) {
      this.logger.warn(
        `Denied ${request.method} ${request.url} - missing user role information`,
      );
      return false;
    }

    const normalizedRole =
      typeof user.role === 'string'
        ? (user.role.toUpperCase() as UserRole)
        : user.role;

    const normalizedRequiredRoles = requiredRoles.map((role) =>
      typeof role === 'string' ? (role.toUpperCase() as UserRole) : role,
    );

    const hasRole = normalizedRequiredRoles.includes(normalizedRole);

    if (!hasRole) {
      this.logger.warn(
        `Denied ${request.method} ${request.url} for user ${
          user.id ?? user.email ?? 'unknown'
        } - role ${user.role} not in [${normalizedRequiredRoles.join(', ')}]`,
      );
    }

    return hasRole;
  }
}

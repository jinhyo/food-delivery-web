import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

type AllowedRoles = keyof typeof UserRole | 'Any';

export function Role(roles: AllowedRoles) {
  return SetMetadata('roles', roles);
}

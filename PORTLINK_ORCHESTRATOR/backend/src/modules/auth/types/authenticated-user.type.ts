import { UserRole } from '../../users/entities/user.entity';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  role: UserRole;
}

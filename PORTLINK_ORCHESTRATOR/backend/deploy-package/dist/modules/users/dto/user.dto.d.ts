import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    fullName?: string;
    phone?: string;
    language?: string;
}
export declare class UpdateUserDto {
    username?: string;
    email?: string;
    role?: UserRole;
    fullName?: string;
    isActive?: boolean;
    phone?: string;
    language?: string;
    avatar?: string;
}
export declare class UpdateProfileDto {
    fullName?: string;
    phone?: string;
    language?: string;
    avatar?: string;
}

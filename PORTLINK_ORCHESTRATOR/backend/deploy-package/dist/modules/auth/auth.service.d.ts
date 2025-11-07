import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            fullName: string;
            isActive: boolean;
            avatar: string;
            phone: string;
            language: string;
            lastLogin: Date;
            permissions: Record<string, any>;
            createdAt: Date;
            updatedAt: Date;
            eventLogs: import("../event-logs/entities/event-log.entity").EventLog[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            fullName: string;
            isActive: boolean;
            avatar: string;
            phone: string;
            language: string;
            lastLogin: Date;
            permissions: Record<string, any>;
            createdAt: Date;
            updatedAt: Date;
            eventLogs: import("../event-logs/entities/event-log.entity").EventLog[];
        };
    }>;
    validateUser(userId: string): Promise<User>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            fullName: string;
            isActive: boolean;
            avatar: string;
            phone: string;
            language: string;
            lastLogin: Date;
            permissions: Record<string, any>;
            createdAt: Date;
            updatedAt: Date;
            eventLogs: import("../event-logs/entities/event-log.entity").EventLog[];
        };
    }>;
    private generateTokens;
    private sanitizeUser;
}

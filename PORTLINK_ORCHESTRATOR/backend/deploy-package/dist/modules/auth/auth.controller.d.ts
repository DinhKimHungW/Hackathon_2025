import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refresh(req: any): Promise<{
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
    logout(): Promise<{
        message: string;
    }>;
    verify(req: any): Promise<{
        valid: boolean;
        user: any;
    }>;
}

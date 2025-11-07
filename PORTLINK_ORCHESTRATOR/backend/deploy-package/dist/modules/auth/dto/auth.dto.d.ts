export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}

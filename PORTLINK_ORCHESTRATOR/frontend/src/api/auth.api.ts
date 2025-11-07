import axiosInstance from './axios.config';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'MANAGER' | 'OPERATIONS' | 'DRIVER';
    isActive: boolean;
    avatar?: string;
    phone?: string;
    language?: string;
    permissions?: string[];
  };
  accessToken: string;  // Backend uses camelCase
  refreshToken: string; // Backend uses camelCase
  expiresIn?: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATIONS' | 'DRIVER';
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;  // Backend uses camelCase
  refreshToken: string; // Backend uses camelCase
}

// Authentication API functions
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<any>('/auth/login', credentials);
    // Backend returns { success: true, data: { user, access_token, refresh_token } }
    return response.data.data || response.data;
  },

  /**
   * Register new user (Admin only)
   */
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<any>('/auth/register', userData);
    // Backend returns { success: true, data: { user, access_token, refresh_token } }
    return response.data.data || response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Change password
   */
  changePassword: async (passwords: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/change-password', passwords);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Verify token validity
   */
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await axiosInstance.post('/auth/verify', { token });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<LoginResponse['user']> => {
    const response = await axiosInstance.get<LoginResponse['user']>('/users/profile');
    return response.data;
  },
};

export default authApi;

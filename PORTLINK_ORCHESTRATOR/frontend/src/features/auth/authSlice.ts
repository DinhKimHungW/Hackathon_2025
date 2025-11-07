import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import authApi from '@api/auth.api';
import type { LoginRequest, RegisterRequest, ChangePasswordRequest } from '@api/auth.api';
import localStorageUtils from '@utils/localStorage';

// User type from auth API
export interface User {
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
}

// Auth state interface
export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state from localStorage or defaults
const initialState: AuthState = {
  user: localStorageUtils.getJSON<User>('user'),
  access_token: localStorageUtils.getString('access_token'),
  refresh_token: localStorageUtils.getString('refresh_token'),
  isAuthenticated: localStorageUtils.has('access_token'),
  loading: false,
  error: null,
};

// Debug: Log initial state
console.log('🔐 Auth InitialState:', {
  hasUser: !!initialState.user,
  hasToken: !!initialState.access_token,
  isAuthenticated: initialState.isAuthenticated,
});

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Store in localStorage using utility (Backend uses camelCase)
      localStorageUtils.setString('access_token', response.accessToken);
      localStorageUtils.setString('refresh_token', response.refreshToken);
      localStorageUtils.setJSON('user', response.user);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      
      // Store in localStorage using utility (Backend uses camelCase)
      localStorageUtils.setString('access_token', response.accessToken);
      localStorageUtils.setString('refresh_token', response.refreshToken);
      localStorageUtils.setJSON('user', response.user);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      
      // Clear localStorage using utility
      localStorageUtils.remove('access_token');
      localStorageUtils.remove('refresh_token');
      localStorageUtils.remove('user');
      
      return null;
    } catch (error: any) {
      // Even if API call fails, still clear local storage
      localStorageUtils.remove('access_token');
      localStorageUtils.remove('refresh_token');
      localStorageUtils.remove('user');
      
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      await authApi.changePassword(passwords);
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const refreshToken = state.auth.refresh_token;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken(refreshToken);
      
      // Update localStorage (Backend uses camelCase)
      localStorageUtils.setString('access_token', response.accessToken);
      localStorageUtils.setString('refresh_token', response.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Refresh token thất bại');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getProfile();
      
      // Update localStorage
      localStorageUtils.setJSON('user', user);
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorageUtils.setJSON('user', action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ access_token: string; refresh_token: string }>) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
      state.isAuthenticated = true;
      localStorageUtils.setString('access_token', action.payload.access_token);
      localStorageUtils.setString('refresh_token', action.payload.refresh_token);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.access_token = action.payload.accessToken;  // Map camelCase to snake_case
      state.refresh_token = action.payload.refreshToken; // Map camelCase to snake_case
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.access_token = action.payload.accessToken;  // Map camelCase to snake_case
      state.refresh_token = action.payload.refreshToken; // Map camelCase to snake_case
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Still clear state even if logout API fails
      state.loading = false;
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Change Password
    builder.addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Refresh Token
    builder.addCase(refreshAccessToken.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(refreshAccessToken.fulfilled, (state, action) => {
      state.loading = false;
      state.access_token = action.payload.accessToken;  // Map camelCase to snake_case
      state.refresh_token = action.payload.refreshToken; // Map camelCase to snake_case
      state.isAuthenticated = true;
    });
    builder.addCase(refreshAccessToken.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
    });

    // Fetch User Profile
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Actions
export const { setUser, clearError, setTokens } = authSlice.actions;

// Selectors
export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: any) => state.auth.loading;
export const selectAuthError = (state: any) => state.auth.error;
export const selectAccessToken = (state: any) => state.auth.access_token;
export const selectUserRole = (state: any) => state.auth.user?.role;
export const selectUserPermissions = (state: any) => state.auth.user?.permissions || [];

// Reducer
export default authSlice.reducer;

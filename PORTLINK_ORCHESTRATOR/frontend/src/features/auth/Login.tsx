import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from './authSlice';
import type { LoginRequest } from '@api/auth.api';
import localStorageUtils from '@utils/localStorage';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  rememberMe: yup.boolean().default(false),
});

export default function Login() {
  // const navigate = useNavigate(); // Not needed - using window.location
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      dispatch(clearError());
      
      const credentials: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const result = await dispatch(loginUser(credentials)).unwrap();
      console.log('✅ Login successful:', result);
      
      // Save remember me preference
      if (data.rememberMe) {
        localStorageUtils.setString('rememberMe', 'true');
        localStorageUtils.setString('rememberedEmail', data.email);
      } else {
        localStorageUtils.remove('rememberMe');
        localStorageUtils.remove('rememberedEmail');
      }
      
      // Verify localStorage is set before navigation
      const hasToken = localStorageUtils.has('access_token');
      console.log('🔑 Has token in localStorage:', hasToken);
      
      if (!hasToken) {
        console.error('❌ Token not saved to localStorage!');
        return;
      }
      
      // Small delay to ensure Redux state is flushed
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Redirect to original location or dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      console.log('🔀 Navigating to:', from);
      
      // Use window.location for reliable navigation after login
      window.location.href = from;
    } catch (err) {
      // Error is handled by Redux
      console.error('❌ Login failed:', err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Logo and Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                PortLink Orchestrator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hệ thống quản lý cảng thông minh
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Email Field */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                      placeholder="admin@portlink.com"
                    />
                  )}
                />

                {/* Password Field */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              disabled={loading}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                {/* Remember Me Checkbox */}
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} disabled={loading} />}
                      label="Ghi nhớ đăng nhập"
                    />
                  )}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Box>
            </form>

            {/* Test Accounts Info */}
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Tài khoản test:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Admin: admin@catlai.com / Admin@2025
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Manager: manager@catlai.com / Manager@2025
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Operations: operations@catlai.com / Operations@2025
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                • Driver: driver@catlai.com / Driver@2025
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography variant="body2" color="white" textAlign="center" sx={{ mt: 3 }}>
          © 2025 PortLink Orchestrator. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

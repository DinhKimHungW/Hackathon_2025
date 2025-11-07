import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectUser, logoutUser } from '@/features/auth/authSlice';

interface UserMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
}

export default function UserMenu({ anchorEl, open, onClose }: UserMenuProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleProfile = () => {
    navigate('/profile');
    onClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose();
    window.location.href = '/login';
  };

  if (!user) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1.5,
          minWidth: 240,
          borderRadius: 2,
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            alt={user.fullName}
            src={user.avatarUrl}
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            {user.fullName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="caption"
          sx={{
            mt: 1,
            px: 1,
            py: 0.5,
            display: 'inline-block',
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 600,
          }}
        >
          {user.role}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>My Profile</ListItemText>
      </MenuItem>

      <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
}

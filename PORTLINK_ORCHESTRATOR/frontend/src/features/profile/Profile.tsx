import { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  CheckCircle,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/features/auth/authSlice';
import { format } from 'date-fns';

export default function Profile() {
  const currentUser = useAppSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    jobTitle: '',
    department: '',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: currentUser?.username || '',
      email: currentUser?.email || '',
      phone: '',
      location: '',
      jobTitle: '',
      department: '',
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // TODO: Save to backend
    setIsEditing(false);
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleAvatarChange = () => {
    console.log('Opening avatar upload dialog');
    // TODO: Implement avatar upload
  };

  // Mock activity data
  const recentActivity = [
    { id: 1, action: 'Created ship visit', date: new Date(), type: 'create' },
    { id: 2, action: 'Updated schedule', date: new Date(Date.now() - 86400000), type: 'update' },
    { id: 3, action: 'Completed task #123', date: new Date(Date.now() - 172800000), type: 'complete' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Left Column - Profile Card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 calc(33.333% - 12px)' } }}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            {/* Avatar */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
                size="small"
                onClick={handleAvatarChange}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>

            {/* Name & Role */}
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {currentUser?.username || 'User Name'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formData.jobTitle || 'Port Operations Manager'}
            </Typography>

            <Chip
              label={currentUser?.role.toUpperCase() || 'USER'}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            {/* Quick Info */}
            <Stack spacing={1.5} alignItems="flex-start">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {currentUser?.email}
                </Typography>
              </Box>

              {formData.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{formData.phone}</Typography>
                </Box>
              )}

              {formData.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">{formData.location}</Typography>
                </Box>
              )}

              {formData.department && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Work fontSize="small" color="action" />
                  <Typography variant="body2">{formData.department}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">
                  Member since {currentUser?.createdAt ? format(new Date(currentUser.createdAt), 'MMM yyyy') : 'Recently'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Right Column - Profile Details & Activity */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 calc(66.667% - 12px)' } }}>
          <Stack spacing={3}>
            {/* Profile Information */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Profile Information
                </Typography>
                {!isEditing ? (
                  <Button startIcon={<Edit />} onClick={handleEdit}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  disabled={!isEditing}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={!isEditing}
                />

                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  disabled={!isEditing}
                  placeholder="+84 123 456 789"
                />

                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={handleChange('location')}
                  disabled={!isEditing}
                  placeholder="Ho Chi Minh City, Vietnam"
                />

                <TextField
                  fullWidth
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={handleChange('jobTitle')}
                  disabled={!isEditing}
                  placeholder="Port Operations Manager"
                />

                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={handleChange('department')}
                  disabled={!isEditing}
                  placeholder="Operations"
                />
              </Box>
            </Paper>

            {/* Recent Activity */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recent Activity
              </Typography>

              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} disablePadding sx={{ py: 1 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={format(activity.date, 'MMM dd, yyyy - HH:mm')}
                    />
                  </ListItem>
                ))}
              </List>

              {recentActivity.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No recent activity
                </Typography>
              )}
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

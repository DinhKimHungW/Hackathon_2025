import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Divider,
  Paper,
  Alert,
  TextField,
} from '@mui/material';
import { Save, Lock, Visibility, History } from '@mui/icons-material';
import { useState } from 'react';

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSave = () => {
    console.log('Saving privacy settings:', {
      profileVisibility,
      activityTracking,
      dataSharing,
      twoFactorAuth,
      sessionTimeout,
    });
  };

  const handleChangePassword = () => {
    console.log('Opening change password dialog');
    // TODO: Open password change dialog
  };

  const handleClearHistory = () => {
    console.log('Clearing browsing history');
    // TODO: Clear browsing history
  };

  const handleExportData = () => {
    console.log('Exporting user data');
    // TODO: Export user data
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Privacy & Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage your privacy and security preferences
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={4}>
        {/* Security Alert */}
        <Alert severity="info" icon={<Lock />}>
          Your account is currently secured with standard authentication. Enable two-factor authentication for enhanced security.
        </Alert>

        {/* Privacy Settings */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Privacy Settings
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Profile Visibility</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow other users to view your profile information
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={activityTracking}
                  onChange={(e) => setActivityTracking(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History fontSize="small" />
                  <Box>
                    <Typography variant="body1">Activity Tracking</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Track and log your activity for analytics
                    </Typography>
                  </Box>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={dataSharing}
                  onChange={(e) => setDataSharing(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Data Sharing</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Share anonymized data for system improvements
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </Paper>

        {/* Security Settings */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Security Settings
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorAuth}
                  onChange={(e) => setTwoFactorAuth(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Two-Factor Authentication</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Add an extra layer of security to your account
                  </Typography>
                </Box>
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Session Timeout (minutes)"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              helperText="Automatically log out after this period of inactivity"
              InputProps={{ inputProps: { min: 5, max: 120, step: 5 } }}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Lock />}
                onClick={handleChangePassword}
                fullWidth
              >
                Change Password
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Data Management */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Data Management
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={handleClearHistory}
                fullWidth
                sx={{ mb: 1 }}
              >
                Clear Browsing History
              </Button>
              <Typography variant="caption" color="text.secondary">
                Remove all your activity history from the system
              </Typography>
            </Box>

            <Box>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={handleExportData}
                fullWidth
                sx={{ mb: 1 }}
              >
                Export My Data
              </Button>
              <Typography variant="caption" color="text.secondary">
                Download a copy of all your data
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

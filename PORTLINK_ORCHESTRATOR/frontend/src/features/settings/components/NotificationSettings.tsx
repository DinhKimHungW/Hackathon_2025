import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { Save, Email, Notifications as NotificationsIcon, Schedule, Warning } from '@mui/icons-material';
import { useState } from 'react';

export default function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [shipArrivals, setShipArrivals] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [conflicts, setConflicts] = useState(true);
  const [scheduleChanges, setScheduleChanges] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleSave = () => {
    console.log('Saving notification settings:', {
      emailNotifications,
      pushNotifications,
      shipArrivals,
      taskAssignments,
      conflicts,
      scheduleChanges,
      systemAlerts,
      dailyDigest,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage how you receive notifications
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={4}>
        {/* Notification Channels */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Notification Channels
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" />
                  <Box>
                    <Typography variant="body1">Email Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive notifications via email
                    </Typography>
                  </Box>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon fontSize="small" />
                  <Box>
                    <Typography variant="body1">Push Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive push notifications in browser
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Stack>
        </Paper>

        {/* Event-based Notifications */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Event Notifications
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={shipArrivals}
                  onChange={(e) => setShipArrivals(e.target.checked)}
                  disabled={!emailNotifications && !pushNotifications}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">Ship Arrivals & Departures</Typography>
                  <Chip label="High Priority" size="small" color="primary" />
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={taskAssignments}
                  onChange={(e) => setTaskAssignments(e.target.checked)}
                  disabled={!emailNotifications && !pushNotifications}
                />
              }
              label="Task Assignments"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={conflicts}
                  onChange={(e) => setConflicts(e.target.checked)}
                  disabled={!emailNotifications && !pushNotifications}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning fontSize="small" color="error" />
                  <Typography variant="body1">Schedule Conflicts</Typography>
                  <Chip label="Critical" size="small" color="error" />
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={scheduleChanges}
                  onChange={(e) => setScheduleChanges(e.target.checked)}
                  disabled={!emailNotifications && !pushNotifications}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" />
                  <Typography variant="body1">Schedule Changes</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={systemAlerts}
                  onChange={(e) => setSystemAlerts(e.target.checked)}
                  disabled={!emailNotifications && !pushNotifications}
                />
              }
              label="System Alerts"
            />
          </Stack>
        </Paper>

        {/* Digest Options */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Digest Options
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  disabled={!emailNotifications}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Daily Digest</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Receive a summary email of daily activities at 8:00 AM
                  </Typography>
                </Box>
              }
            />
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

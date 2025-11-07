import { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette,
  Notifications,
  Security,
} from '@mui/icons-material';
import GeneralSettings from './components/GeneralSettings.tsx';
import AppearanceSettings from './components/AppearanceSettings.tsx';
import NotificationSettings from './components/NotificationSettings.tsx';
import PrivacySettings from './components/PrivacySettings.tsx';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your application preferences and configurations
        </Typography>
      </Box>

      {/* Settings Panel */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<SettingsIcon />}
              label="General"
              iconPosition="start"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
            <Tab
              icon={<Palette />}
              label="Appearance"
              iconPosition="start"
              id="settings-tab-1"
              aria-controls="settings-tabpanel-1"
            />
            <Tab
              icon={<Notifications />}
              label="Notifications"
              iconPosition="start"
              id="settings-tab-2"
              aria-controls="settings-tabpanel-2"
            />
            <Tab
              icon={<Security />}
              label="Privacy & Security"
              iconPosition="start"
              id="settings-tab-3"
              aria-controls="settings-tabpanel-3"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <GeneralSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <AppearanceSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <NotificationSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <PrivacySettings />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}

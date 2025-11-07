import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  Divider,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Save, LightMode, DarkMode, SettingsBrightness } from '@mui/icons-material';
import { useState } from 'react';
import { useThemeMode } from '@/theme/ThemeModeProvider';

const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (Default)' },
  { value: 'large', label: 'Large' },
];

export default function AppearanceSettings() {
  const { mode, setMode } = useThemeMode();
  const [fontSize, setFontSize] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);

  const handleSave = () => {
    // TODO: Save settings to localStorage
    console.log('Saving appearance settings:', {
      theme: mode,
      fontSize,
      compactMode,
      showAnimations,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Appearance Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Customize how the application looks
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={4}>
        {/* Theme Mode */}
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Theme Mode
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose your preferred color scheme
          </Typography>
          
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_e, value) => value && setMode(value)}
            aria-label="theme mode"
            fullWidth
          >
            <ToggleButton value="light" aria-label="light mode">
              <LightMode sx={{ mr: 1 }} />
              Light
            </ToggleButton>
            <ToggleButton value="dark" aria-label="dark mode">
              <DarkMode sx={{ mr: 1 }} />
              Dark
            </ToggleButton>
            <ToggleButton value="auto" aria-label="auto mode">
              <SettingsBrightness sx={{ mr: 1 }} />
              Auto
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Theme Preview */}
          <Paper
            elevation={2}
            sx={{
              mt: 2,
              p: 3,
              bgcolor: mode === 'light' ? '#fff' : mode === 'dark' ? '#1a1a1a' : 'background.paper',
              color: mode === 'light' ? '#000' : mode === 'dark' ? '#fff' : 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Typography variant="body2">
              This is how your interface will look
            </Typography>
          </Paper>
        </Box>

        {/* Font Size */}
        <FormControl fullWidth>
          <InputLabel>Font Size</InputLabel>
          <Select
            value={fontSize}
            label="Font Size"
            onChange={(e) => setFontSize(e.target.value)}
          >
            {FONT_SIZES.map((size) => (
              <MenuItem key={size.value} value={size.value}>
                {size.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Compact Mode */}
        <FormControlLabel
          control={
            <Switch
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body1">Compact Mode</Typography>
              <Typography variant="caption" color="text.secondary">
                Reduce spacing and padding for more content density
              </Typography>
            </Box>
          }
        />

        {/* Show Animations */}
        <FormControlLabel
          control={
            <Switch
              checked={showAnimations}
              onChange={(e) => setShowAnimations(e.target.checked)}
            />
          }
          label={
            <Box>
              <Typography variant="body1">Show Animations</Typography>
              <Typography variant="caption" color="text.secondary">
                Enable smooth transitions and animations
              </Typography>
            </Box>
          }
        />

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

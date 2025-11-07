import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useState } from 'react';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
];

const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const TIME_FORMATS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
];

export default function GeneralSettings() {
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [itemsPerPage, setItemsPerPage] = useState('20');

  const handleSave = () => {
    // TODO: Save settings to backend/localStorage
    console.log('Saving general settings:', {
      language,
      timezone,
      dateFormat,
      timeFormat,
      itemsPerPage,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        General Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure basic application settings
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={3}>
        {/* Language */}
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Timezone */}
        <FormControl fullWidth>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={timezone}
            label="Timezone"
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map((tz) => (
              <MenuItem key={tz.value} value={tz.value}>
                {tz.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Format */}
        <FormControl fullWidth>
          <InputLabel>Date Format</InputLabel>
          <Select
            value={dateFormat}
            label="Date Format"
            onChange={(e) => setDateFormat(e.target.value)}
          >
            {DATE_FORMATS.map((format) => (
              <MenuItem key={format.value} value={format.value}>
                {format.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Time Format */}
        <FormControl fullWidth>
          <InputLabel>Time Format</InputLabel>
          <Select
            value={timeFormat}
            label="Time Format"
            onChange={(e) => setTimeFormat(e.target.value)}
          >
            {TIME_FORMATS.map((format) => (
              <MenuItem key={format.value} value={format.value}>
                {format.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Items Per Page */}
        <TextField
          fullWidth
          type="number"
          label="Items Per Page"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(e.target.value)}
          helperText="Number of items to display per page in lists"
          InputProps={{ inputProps: { min: 10, max: 100, step: 10 } }}
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

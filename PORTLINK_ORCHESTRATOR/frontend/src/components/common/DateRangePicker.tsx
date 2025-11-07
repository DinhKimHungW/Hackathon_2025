import { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
}

type Preset = 'custom' | 'today' | 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days';

export default function DateRangePicker({ value, onChange, label = 'Date Range' }: DateRangePickerProps) {
  const [preset, setPreset] = useState<Preset>('custom');

  const handlePresetChange = (event: SelectChangeEvent<Preset>) => {
    const newPreset = event.target.value as Preset;
    setPreset(newPreset);

    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    switch (newPreset) {
      case 'today':
        from = startOfDay(now);
        to = endOfDay(now);
        break;
      case 'thisWeek':
        from = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        to = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case 'last7Days':
        from = startOfDay(subDays(now, 7));
        to = endOfDay(now);
        break;
      case 'last30Days':
        from = startOfDay(subDays(now, 30));
        to = endOfDay(now);
        break;
      case 'custom':
      default:
        from = null;
        to = null;
    }

    onChange({ from, to });
  };

  const handleFromChange = (date: Date | null) => {
    setPreset('custom');
    onChange({ from: date, to: value.to });
  };

  const handleToChange = (date: Date | null) => {
    setPreset('custom');
    onChange({ from: value.from, to: date });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>{label}</InputLabel>
          <Select value={preset} onChange={handlePresetChange} label={label}>
            <MenuItem value="custom">Custom Range</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="thisWeek">This Week</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="last7Days">Last 7 Days</MenuItem>
            <MenuItem value="last30Days">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <DatePicker
            label="From Date"
            value={value.from}
            onChange={handleFromChange}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
          <DatePicker
            label="To Date"
            value={value.to}
            onChange={handleToChange}
            minDate={value.from || undefined}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

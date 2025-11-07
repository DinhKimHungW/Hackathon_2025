import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Delete, Star, StarBorder } from '@mui/icons-material';
import { useState, useEffect } from 'react';

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    search?: string;
    dateRange?: { start: Date | null; end: Date | null };
    status?: string[];
    shipType?: string[];
    berth?: string[];
  };
  isDefault?: boolean;
  createdAt: Date;
}

interface FilterPresetsDialogProps {
  open: boolean;
  onClose: () => void;
  currentFilters: FilterPreset['filters'];
  onApplyPreset: (preset: FilterPreset) => void;
}

const STORAGE_KEY = 'shipVisit_filterPresets';

export default function FilterPresetsDialog({
  open,
  onClose,
  currentFilters,
  onApplyPreset,
}: FilterPresetsDialogProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load presets from localStorage
  useEffect(() => {
    if (open) {
      loadPresets();
    }
  }, [open]);

  const loadPresets = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const presetsWithDates = parsed.map((preset: FilterPreset) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          filters: {
            ...preset.filters,
            dateRange: preset.filters.dateRange
              ? {
                  start: preset.filters.dateRange.start
                    ? new Date(preset.filters.dateRange.start)
                    : null,
                  end: preset.filters.dateRange.end
                    ? new Date(preset.filters.dateRange.end)
                    : null,
                }
              : undefined,
          },
        }));
        setPresets(presetsWithDates);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
  };

  const savePresets = (updatedPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
      setPresets(updatedPresets);
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name: presetName.trim(),
      filters: currentFilters,
      createdAt: new Date(),
    };

    const updatedPresets = [...presets, newPreset];
    savePresets(updatedPresets);
    setPresetName('');
    setIsSaving(false);
  };

  const handleDeletePreset = (id: string) => {
    const updatedPresets = presets.filter((p) => p.id !== id);
    savePresets(updatedPresets);
  };

  const handleSetDefault = (id: string) => {
    const updatedPresets = presets.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    savePresets(updatedPresets);
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onApplyPreset(preset);
    onClose();
  };

  const getActiveFiltersCount = (filters: FilterPreset['filters']) => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.shipType && filters.shipType.length > 0) count++;
    if (filters.berth && filters.berth.length > 0) count++;
    return count;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Presets</DialogTitle>
      <DialogContent>
        {/* Save Current Filters */}
        {!isSaving ? (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsSaving(true)}
            >
              Save Current Filters as Preset
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePreset();
                if (e.key === 'Escape') setIsSaving(false);
              }}
            />
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save
            </Button>
            <Button onClick={() => setIsSaving(false)}>Cancel</Button>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Saved Presets */}
        {presets.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No saved presets yet
          </Typography>
        ) : (
          <List>
            {presets.map((preset) => {
              const filterCount = getActiveFiltersCount(preset.filters);
              return (
                <ListItem
                  key={preset.id}
                  component="button"
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                    display: 'flex',
                    width: '100%',
                    textAlign: 'left',
                  }}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">{preset.name}</Typography>
                        {preset.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {filterCount} {filterCount === 1 ? 'filter' : 'filters'} •{' '}
                          {preset.createdAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(preset.id);
                      }}
                      sx={{ mr: 1 }}
                    >
                      {preset.isDefault ? (
                        <Star color="warning" fontSize="small" />
                      ) : (
                        <StarBorder fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

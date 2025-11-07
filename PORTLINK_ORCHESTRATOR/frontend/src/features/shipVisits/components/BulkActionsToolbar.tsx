import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close,
  MoreVert,
  Delete,
  GetApp,
  Anchor,
  CheckCircle,
} from '@mui/icons-material';
import { useState } from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkStatusChange?: () => void;
  onBulkAssignBerth?: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkExport,
  onBulkStatusChange,
  onBulkAssignBerth,
}: BulkActionsToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 80,
        zIndex: 10,
        mb: 2,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 2,
      }}
    >
      {/* Select All Checkbox */}
      <Checkbox
        checked={allSelected}
        indeterminate={selectedCount > 0 && selectedCount < totalCount}
        onChange={allSelected ? onDeselectAll : onSelectAll}
        sx={{
          color: 'primary.contrastText',
          '&.Mui-checked': { color: 'primary.contrastText' },
          '&.MuiCheckbox-indeterminate': { color: 'primary.contrastText' },
        }}
      />

      {/* Selection Count */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
        {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
      </Typography>

      {/* Quick Actions */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
        <Button
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<GetApp />}
          onClick={onBulkExport}
          sx={{ color: 'primary.main' }}
        >
          Export
        </Button>

        {onBulkStatusChange && (
          <Button
            variant="contained"
            color="inherit"
            size="small"
            startIcon={<CheckCircle />}
            onClick={onBulkStatusChange}
            sx={{ color: 'primary.main' }}
          >
            Change Status
          </Button>
        )}

        {onBulkAssignBerth && (
          <Button
            variant="contained"
            color="inherit"
            size="small"
            startIcon={<Anchor />}
            onClick={onBulkAssignBerth}
            sx={{ color: 'primary.main' }}
          >
            Assign Berth
          </Button>
        )}

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<Delete />}
          onClick={onBulkDelete}
        >
          Delete
        </Button>
      </Box>

      {/* More Actions Menu (Mobile) */}
      <IconButton
        sx={{ display: { xs: 'block', md: 'none' }, color: 'inherit' }}
        onClick={handleMenuOpen}
      >
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction(onBulkExport)}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Selected</ListItemText>
        </MenuItem>

        {onBulkStatusChange && (
          <MenuItem onClick={() => handleAction(onBulkStatusChange)}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Change Status</ListItemText>
          </MenuItem>
        )}

        {onBulkAssignBerth && (
          <MenuItem onClick={() => handleAction(onBulkAssignBerth)}>
            <ListItemIcon>
              <Anchor fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Berth</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={() => handleAction(onBulkDelete)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Deselect All */}
      <IconButton
        onClick={onDeselectAll}
        sx={{ color: 'inherit' }}
        title="Deselect All"
      >
        <Close />
      </IconButton>
    </Paper>
  );
}

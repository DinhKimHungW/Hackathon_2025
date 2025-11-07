import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useResponsive } from '../hooks/useResponsive';
import type { ListToolbarProps } from '../types';

export const ResponsiveListToolbar: React.FC<ListToolbarProps> = ({
  viewMode,
  onViewModeChange,
  selectedCount,
  onDeleteSelected,
  onExport,
  onFilterClick,
  onSearchChange,
  activeFilters,
  onClearFilter,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const actions = [
    { icon: viewMode === 'list' ? <GridViewIcon /> : <ListViewIcon />, 
      name: `Switch to ${viewMode === 'list' ? 'Grid' : 'List'} View`,
      onClick: () => onViewModeChange(viewMode === 'list' ? 'grid' : 'list') },
    { icon: <FilterIcon />, 
      name: 'Filters',
      onClick: onFilterClick },
    ...(selectedCount > 0 ? [{
      icon: <DeleteIcon />,
      name: `Delete Selected (${selectedCount})`,
      onClick: onDeleteSelected
    }] : []),
    { icon: <ExportIcon />, 
      name: 'Export',
      onClick: onExport }
  ];

  const toolbarHeight = isMobile ? 56 : 64;

  return (
    <Box sx={{
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
      height: toolbarHeight,
      display: 'flex',
      alignItems: 'center',
      px: { xs: 1, sm: 2 },
    }}>
      {/* Search Field - Always Visible */}
      <TextField
        size={isMobile ? "small" : "medium"}
        placeholder="Search schedules..."
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ 
          flex: 1,
          maxWidth: { xs: '100%', sm: 300 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Desktop/Tablet Actions */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <Tooltip title="Change view">
            <IconButton onClick={() => onViewModeChange(viewMode === 'list' ? 'grid' : 'list')}>
              {viewMode === 'list' ? <GridViewIcon /> : <ListViewIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter list">
            <IconButton onClick={onFilterClick}>
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {selectedCount > 0 && (
            <Tooltip title="Delete selected">
              <IconButton onClick={onDeleteSelected}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Export">
            <IconButton onClick={onExport}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Mobile Actions */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Schedule actions"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          icon={<SpeedDialIcon openIcon={<MenuIcon />} />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
          direction="up"
          FabProps={{
            size: "medium"
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
              FabProps={{
                size: "small"
              }}
            />
          ))}
        </SpeedDial>
      )}
    </Box>
  );
};
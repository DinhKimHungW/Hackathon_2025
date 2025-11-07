import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { GridView, ViewList, TableChart } from '@mui/icons-material';

export type ViewMode = 'grid' | 'list' | 'table';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      onChange(newView);
    }
  };

  return (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleChange}
      aria-label="view mode"
      size="small"
      sx={{
        bgcolor: 'background.paper',
        '& .MuiToggleButton-root': {
          px: 2,
          py: 0.75,
          border: '1px solid',
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        },
      }}
    >
      <ToggleButton value="grid" aria-label="grid view">
        <Tooltip title="Grid View" arrow>
          <GridView fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="list" aria-label="list view">
        <Tooltip title="List View" arrow>
          <ViewList fontSize="small" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="table" aria-label="table view">
        <Tooltip title="Table View" arrow>
          <TableChart fontSize="small" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

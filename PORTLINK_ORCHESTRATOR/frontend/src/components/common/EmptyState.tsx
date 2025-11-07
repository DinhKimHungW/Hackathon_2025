import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import {
  InboxOutlined,
  SearchOff,
  ErrorOutline,
  AddCircleOutline,
} from '@mui/icons-material';

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /**
   * Type of empty state
   */
  type?: 'no-data' | 'no-results' | 'error' | 'custom';
  /**
   * Icon to display (overrides default icon for type)
   */
  icon?: React.ReactNode;
  /**
   * Title/heading text
   */
  title: string;
  /**
   * Description/subtitle text
   */
  description?: string;
  /**
   * Action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /**
   * Secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /**
   * Show in a Paper container (default: true)
   */
  paper?: boolean;
  /**
   * Minimum height (default: '400px')
   */
  minHeight?: string | number;
}

/**
 * Default icons for each empty state type
 */
const DEFAULT_ICONS = {
  'no-data': InboxOutlined,
  'no-results': SearchOff,
  error: ErrorOutline,
  custom: InboxOutlined,
};

/**
 * EmptyState Component
 * 
 * Display a friendly empty state message when there's no data,
 * no search results, or an error occurred.
 * 
 * @example
 * ```tsx
 * // No data state
 * <EmptyState
 *   type="no-data"
 *   title="No ship visits yet"
 *   description="Create your first ship visit to get started"
 *   action={{
 *     label: "Create Ship Visit",
 *     onClick: handleCreate,
 *     icon: <Add />
 *   }}
 * />
 * 
 * // No search results
 * <EmptyState
 *   type="no-results"
 *   title="No results found"
 *   description="Try adjusting your search or filters"
 * />
 * 
 * // Error state
 * <EmptyState
 *   type="error"
 *   title="Failed to load data"
 *   description="Please try again later"
 *   action={{
 *     label: "Retry",
 *     onClick: handleRetry
 *   }}
 * />
 * ```
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  icon,
  title,
  description,
  action,
  secondaryAction,
  paper = true,
  minHeight = '400px',
}) => {
  // Select icon
  const IconComponent = icon ? null : DEFAULT_ICONS[type];

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 4,
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      {icon ? (
        <Box sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}>
          {icon}
        </Box>
      ) : IconComponent ? (
        <IconComponent
          sx={{
            fontSize: 80,
            color: 'text.secondary',
            mb: 2,
          }}
        />
      ) : null}

      {/* Title */}
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 500 }}
        >
          {description}
        </Typography>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {action && (
            <Button
              variant="contained"
              size="large"
              startIcon={action.icon || <AddCircleOutline />}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              size="large"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );

  // Wrap in Paper if requested
  if (paper) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        {content}
      </Paper>
    );
  }

  return content;
};

export default EmptyState;

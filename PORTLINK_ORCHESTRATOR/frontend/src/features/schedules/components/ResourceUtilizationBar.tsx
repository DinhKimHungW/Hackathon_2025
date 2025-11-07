import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

interface ResourceUtilizationBarProps {
  value: number;
  color: string;
  showLabel?: boolean;
  height?: number;
  tooltip?: string;
}

export const ResourceUtilizationBar: React.FC<ResourceUtilizationBarProps> = ({
  value,
  color,
  showLabel = false,
  height = 4,
  tooltip,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const label = `${Math.round(normalizedValue)}%`;

  const bar = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: '100%',
          height,
          bgcolor: '#eee',
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${normalizedValue}%`,
            height: '100%',
            bgcolor: color,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
      {showLabel && (
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {label}
        </Typography>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <Box>{bar}</Box>
      </Tooltip>
    );
  }

  return bar;
};
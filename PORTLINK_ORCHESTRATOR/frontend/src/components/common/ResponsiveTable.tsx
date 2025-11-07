import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

interface Column {
  field: string;
  header: string;
  render?: (row: any) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'right' | 'center';
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  rowKey?: string;
  emptyMessage?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick,
  rowKey = 'id',
  emptyMessage = 'No data available',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  // Mobile view: Card-based
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((row) => (
          <Card
            key={row[rowKey]}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick
                ? { boxShadow: 3, transform: 'translateY(-2px)' }
                : {},
              transition: 'all 0.2s',
            }}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent>
              {columns.map((column) => (
                <Box key={column.field} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {column.header}
                  </Typography>
                  <Typography variant="body2">
                    {column.render ? column.render(row) : row[column.field] || '-'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop view: Table
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                align={column.align || 'left'}
                sx={{ width: column.width, fontWeight: 600 }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row[rowKey]}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align || 'left'}>
                  {column.render ? column.render(row) : row[column.field] || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;

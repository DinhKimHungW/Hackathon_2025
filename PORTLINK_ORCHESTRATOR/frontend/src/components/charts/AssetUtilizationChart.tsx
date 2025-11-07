import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AssetUtilizationData } from '@api/kpi.api';

interface AssetUtilizationChartProps {
  data: AssetUtilizationData[];
  loading?: boolean;
}

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0'];

export default function AssetUtilizationChart({ data, loading }: AssetUtilizationChartProps) {
  // Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={320} />
      </Paper>
    );
  }

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Asset Utilization by Type
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 320,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Không có dữ liệu
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Asset Utilization by Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Available vs In Use
      </Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="type"
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Utilization Rate') {
                  return [`${value}%`, name];
                }
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <Bar dataKey="available" fill="#2e7d32" name="Available" />
            <Bar dataKey="inUse" fill="#1976d2" name="In Use" />
            <Bar
              dataKey="utilizationRate"
              fill="#ed6c02"
              name="Utilization Rate (%)"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

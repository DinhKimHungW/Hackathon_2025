import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ShipArrivalData } from '@api/kpi.api';

interface ShipArrivalsChartProps {
  data: ShipArrivalData[];
  loading?: boolean;
}

export default function ShipArrivalsChart({ data, loading }: ShipArrivalsChartProps) {
  // Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={320} />
      </Paper>
    );
  }

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Lượt tàu cập cảng
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
        Ship Arrivals & Departures
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last 7 days trend
      </Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
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
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="arrivals"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ fill: '#1976d2', r: 4 }}
              activeDot={{ r: 6 }}
              name="Arrivals"
            />
            <Line
              type="monotone"
              dataKey="departures"
              stroke="#d32f2f"
              strokeWidth={2}
              dot={{ fill: '#d32f2f', r: 4 }}
              activeDot={{ r: 6 }}
              name="Departures"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2e7d32"
              strokeWidth={2}
              dot={{ fill: '#2e7d32', r: 4 }}
              activeDot={{ r: 6 }}
              name="Net Change"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

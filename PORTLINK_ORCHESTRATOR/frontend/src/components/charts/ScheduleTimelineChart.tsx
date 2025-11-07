import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ScheduleTimelineData } from '@api/kpi.api';

interface ScheduleTimelineChartProps {
  data: ScheduleTimelineData[];
  loading?: boolean;
}

export default function ScheduleTimelineChart({ data, loading }: ScheduleTimelineChartProps) {
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
          Schedule Timeline
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
        Schedule Timeline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Schedule progress over time
      </Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
            />
            <Area
              type="monotone"
              dataKey="scheduled"
              stroke="#1976d2"
              fillOpacity={1}
              fill="url(#colorScheduled)"
              name="Scheduled"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="active"
              stroke="#2e7d32"
              fillOpacity={1}
              fill="url(#colorActive)"
              name="Active"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#9c27b0"
              fillOpacity={1}
              fill="url(#colorCompleted)"
              name="Completed"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

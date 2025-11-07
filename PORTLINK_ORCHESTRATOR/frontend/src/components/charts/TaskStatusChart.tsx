import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TaskStatusData } from '@api/kpi.api';

interface TaskStatusChartProps {
  data: TaskStatusData[];
  loading?: boolean;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function TaskStatusChart({ data, loading }: TaskStatusChartProps) {
  // Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="circular" width={280} height={280} sx={{ mx: 'auto' }} />
      </Paper>
    );
  }

  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Trạng thái Task
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
        Task Status Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Current task breakdown
      </Typography>
      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} (${props.payload.percentage}%)`,
                props.payload.status,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(_value, entry: any) => `${entry.payload.status} (${entry.payload.count})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

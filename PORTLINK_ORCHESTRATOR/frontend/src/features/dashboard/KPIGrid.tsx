import { Box } from '@mui/material';
import { memo, useMemo } from 'react';
import {
  DirectionsBoat,
  Assignment,
  Inventory,
  CalendarMonth,
} from '@mui/icons-material';
import StatCard from '@components/common/StatCard';
import { useAppSelector } from '@store/hooks';
import { selectKPISummary, selectKPILoading } from './kpiSlice';
import colors from '@/theme/colors';

function KPIGrid() {
  const summary = useAppSelector(selectKPISummary);
  const loading = useAppSelector(selectKPILoading);

  // Memoize safe defaults to avoid recreating objects on every render
  const ships = useMemo(
    () => summary?.ships || { total: 0, berthing: 0, loading: 0 },
    [summary?.ships]
  );
  
  const tasks = useMemo(
    () => summary?.tasks || { active: 0, completionRate: 0 },
    [summary?.tasks]
  );
  
  const assets = useMemo(
    () => summary?.assets || { utilizationRate: 0, inUse: 0, available: 0 },
    [summary?.assets]
  );
  
  const schedules = useMemo(
    () => summary?.schedules || { active: 0, pending: 0, conflictsDetected: 0 },
    [summary?.schedules]
  );

  // Mock sparkline data (last 7 days trend) - memoized
  const shipSparkline = useMemo(() => [12, 15, 13, 18, 16, 19, ships.total || 17], [ships.total]);
  const taskSparkline = useMemo(() => [85, 78, 82, 88, 86, 90, tasks.active || 87], [tasks.active]);
  const assetSparkline = useMemo(() => [65, 70, 68, 72, 75, 73, assets.utilizationRate || 74], [assets.utilizationRate]);
  const scheduleSparkline = useMemo(() => [8, 10, 9, 12, 11, 14, schedules.active || 13], [schedules.active]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* Ship Visits KPI */}
      <StatCard
        title="Ship Visits"
        value={ships.total}
        icon={<DirectionsBoat fontSize="large" />}
        color={colors.ocean[500]}
        subtitle={`${ships.berthing} berthing, ${ships.loading} loading`}
        loading={loading}
        trend={{
          value: 8.2,
          isPositive: true,
        }}
        sparklineData={shipSparkline}
      />

      {/* Active Tasks KPI */}
      <StatCard
        title="Active Tasks"
        value={tasks.active}
        icon={<Assignment fontSize="large" />}
        color={colors.success[600]}
        subtitle={`${tasks.completionRate.toFixed(0)}% completion rate`}
        loading={loading}
        suffix="tasks"
        trend={{
          value: 5.4,
          isPositive: true,
        }}
        sparklineData={taskSparkline}
      />

      {/* Asset Utilization KPI */}
      <StatCard
        title="Asset Utilization"
        value={assets.utilizationRate.toFixed(0)}
        icon={<Inventory fontSize="large" />}
        color={colors.sunset[500]}
        subtitle={`${assets.inUse} in use, ${assets.available} available`}
        loading={loading}
        suffix="%"
        trend={{
          value: -2.1,
          isPositive: false,
        }}
        sparklineData={assetSparkline}
      />

      {/* Schedules KPI */}
      <StatCard
        title="Active Schedules"
        value={schedules.active}
        icon={<CalendarMonth fontSize="large" />}
        color={colors.navy[600]}
        subtitle={`${schedules.pending} pending, ${schedules.conflictsDetected} conflicts`}
        loading={loading}
        trend={{
          value: 12.5,
          isPositive: true,
        }}
        sparklineData={scheduleSparkline}
      />
    </Box>
  );
}

// Export memoized version to prevent re-renders when parent re-renders
export default memo(KPIGrid);

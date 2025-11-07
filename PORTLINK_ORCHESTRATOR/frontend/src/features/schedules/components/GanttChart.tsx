import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitIcon,
  CalendarToday as DayIcon,
  CalendarViewWeek as WeekIcon,
  CalendarViewMonth as MonthIcon,
} from '@mui/icons-material';
import * as d3 from 'd3';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import type { Schedule } from '../types';

interface GanttChartProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
  height?: number;
}

type ViewMode = 'day' | 'week' | 'month';

export const GanttChart: React.FC<GanttChartProps> = ({
  schedules,
  onScheduleClick,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [zoom, setZoom] = useState(1);

  // Calculate statistics
  const stats = {
    total: schedules.length,
    inProgress: schedules.filter(s => s.status === 'IN_PROGRESS').length,
    scheduled: schedules.filter(s => s.status === 'SCHEDULED').length,
    completed: schedules.filter(s => s.status === 'COMPLETED').length,
    ships: new Set(schedules.map(s => s.shipVisit?.vesselName).filter(Boolean)).size,
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || schedules.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 60, right: 30, bottom: 30, left: 250 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Calculate time range
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (viewMode) {
      case 'day':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'month':
        startDate = now;
        endDate = addDays(now, 30);
        break;
    }

    const clampDateToRange = (date: Date) => {
      if (date < startDate) return startDate;
      if (date > endDate) return endDate;
      return date;
    };

    // Group schedules by ship/berth/operation for better visualization
    const groupedSchedules = schedules.reduce((acc, schedule) => {
      let key = '';
      
      // Priority 1: Group by ship name if available
      if (schedule.shipVisit?.vesselName) {
        const berth = schedule.resources?.berthName || schedule.resources?.berthId || 
                      schedule.berthName || '';
        key = `🚢 ${schedule.shipVisit.vesselName}${berth ? ` - ${berth}` : ''}`;
      }
      // Priority 2: Group by shipVisitName if shipVisit object not populated
      else if (schedule.shipVisitName) {
        const berth = schedule.berthName || '';
        key = `🚢 ${schedule.shipVisitName}${berth ? ` - ${berth}` : ''}`;
      }
      // Priority 3: Group by berth only
      else if (schedule.resources?.berthName || schedule.resources?.berthId || schedule.berthName) {
        const berth = schedule.resources?.berthName || schedule.resources?.berthId || schedule.berthName;
        key = `⚓ Bến ${berth}`;
      }
      // Priority 4: Group by operation name
      else if (schedule.operation || schedule.name) {
        const opName = schedule.operation || schedule.name;
        // Categorize by keywords in operation name
        if (opName.toLowerCase().includes('container') || opName.toLowerCase().includes('hàng')) {
          key = '📦 Xếp Dỡ Hàng';
        } else if (opName.toLowerCase().includes('meeting') || opName.toLowerCase().includes('họp') || 
                   opName.toLowerCase().includes('plan')) {
          key = '👥 Họp & Lập Kế Hoạch';
        } else if (opName.toLowerCase().includes('kiểm tra') || opName.toLowerCase().includes('inspection') ||
                   opName.toLowerCase().includes('check')) {
          key = '🔍 Kiểm Tra';
        } else if (opName.toLowerCase().includes('pilot') || opName.toLowerCase().includes('hoa tiêu')) {
          key = '🚦 Hoa Tiêu & Dẫn Tàu';
        } else if (opName.toLowerCase().includes('berth') || opName.toLowerCase().includes('dock') ||
                   opName.toLowerCase().includes('bến')) {
          key = '⚓ Hoạt Động Bến';
        } else {
          key = `📋 ${opName.substring(0, 30)}...`;
        }
      }
      // Fallback: Other
      else {
        key = '📌 Công Việc Khác';
      }
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(schedule);
      return acc;
    }, {} as Record<string, Schedule[]>);

    const groups = Object.keys(groupedSchedules).sort();
    const rowHeight = 60; // Increased for better readability
    const totalHeight = Math.max(chartHeight, groups.length * rowHeight + 40);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([0, width * zoom]);

    const yScale = d3
      .scaleBand()
      .domain(groups)
      .range([0, totalHeight])
      .padding(0.2);

    // Create main group
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', totalHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines (vertical - time)
    const timePoints = viewMode === 'day'
      ? eachHourOfInterval({ start: startDate, end: endDate })
      : eachDayOfInterval({ start: startDate, end: endDate });
    
    g.selectAll('.grid-line')
      .data(timePoints)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', totalHeight)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Add time axis (top)
    const xAxis = d3
      .axisTop(xScale)
      .ticks(viewMode === 'day' ? d3.timeHour.every(2) : d3.timeDay.every(1))
      .tickFormat((d) => {
        if (viewMode === 'day') {
          return format(d as Date, 'HH:mm');
        }
        return format(d as Date, 'MMM dd');
      });

    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dx', '0')
      .attr('dy', '-5');

    // Add y-axis (groups)
    const yAxis = d3.axisLeft(yScale);
    
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#1976d2')
      .each(function(d) {
        const text = d3.select(this);
        const textContent = d as string;
        // Truncate long text with tooltip
        if (textContent.length > 40) {
          text.text(textContent.substring(0, 37) + '...');
          text.append('title').text(textContent);
        }
      });

    // Add horizontal grid lines
    g.selectAll('.group-line')
      .data(groups)
      .enter()
      .append('line')
      .attr('class', 'group-line')
      .attr('x1', 0)
      .attr('x2', width * zoom)
      .attr('y1', (d) => yScale(d)! + yScale.bandwidth())
      .attr('y2', (d) => yScale(d)! + yScale.bandwidth())
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1);

    // Color scale for schedule status - improved colors
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
      .range(['#FFA726', '#42A5F5', '#66BB6A', '#BDBDBD', '#EF5350']);

    // Draw schedule bars with improved styling
    groups.forEach((group) => {
      const groupSchedules = groupedSchedules[group];
      
      groupSchedules.forEach((schedule: Schedule) => {
        const startTime = new Date(schedule.startTime);
        const endTime = new Date(schedule.endTime);

        // Skip if outside view range
        if (endTime < startDate || startTime > endDate) return;

        const clampedStart = clampDateToRange(startTime);
        const clampedEnd = clampDateToRange(endTime);
        if (clampedEnd <= clampedStart) return;

        const x = xScale(clampedStart);
        const barWidth = Math.max(xScale(clampedEnd) - x, 3);
        const y = yScale(group)!;
        const barHeight = yScale.bandwidth() * 0.85; // Leave some gap

        // Schedule bar group
        const bar = g.append('g')
          .attr('class', 'schedule-bar')
          .style('cursor', 'pointer')
          .on('click', () => onScheduleClick?.(schedule));

        // Shadow for depth
        bar.append('rect')
          .attr('x', x + 2)
          .attr('y', y + 2)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('fill', '#000')
          .attr('opacity', 0.1)
          .attr('rx', 6);

        // Main bar background
        bar.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', barWidth)
          .attr('height', barHeight)
          .attr('fill', colorScale(schedule.status))
          .attr('rx', 6)
          .attr('opacity', 0.85)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .on('mouseenter', function() {
            d3.select(this)
              .attr('opacity', 1)
              .attr('stroke', '#1976d2')
              .attr('stroke-width', 3);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .attr('opacity', 0.85)
              .attr('stroke', '#fff')
              .attr('stroke-width', 1.5);
          });

        // Progress indicator (darker overlay)
        if (schedule.completionPercentage && schedule.completionPercentage > 0) {
          bar.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', Math.max(barWidth * (schedule.completionPercentage / 100), 3))
            .attr('height', barHeight)
            .attr('fill', '#000')
            .attr('rx', 6)
            .attr('opacity', 0.25);
          
          // Progress percentage badge
          if (barWidth > 80) {
            bar.append('text')
              .attr('x', x + barWidth - 8)
              .attr('y', y + barHeight - 6)
              .attr('text-anchor', 'end')
              .text(`${schedule.completionPercentage}%`)
              .style('font-size', '9px')
              .style('fill', '#000')
              .style('font-weight', 'bold')
              .style('opacity', 0.9)
              .style('pointer-events', 'none')
              .style('text-shadow', '0 0 2px rgba(255,255,255,0.8)');
          }
        }

        // Priority indicator (left stripe)
        if (schedule.priority && schedule.priority >= 8) {
          bar.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', 4)
            .attr('height', barHeight)
            .attr('fill', schedule.priority >= 9 ? '#D32F2F' : '#F57C00')
            .attr('rx', 6)
            .attr('opacity', 1);
        }

        // Schedule label - improved text layout with better contrast
        if (barWidth > 120) {
          // Operation name (main text)
          const operationText = schedule.operation || schedule.name || 'Schedule';
          const maxLength = Math.floor((barWidth - 20) / 7); // Approximate chars that fit
          
          bar.append('text')
            .attr('x', x + 10)
            .attr('y', y + barHeight / 2 - 8)
            .text(operationText.length > maxLength ? operationText.substring(0, maxLength - 3) + '...' : operationText)
            .style('font-size', '12px')
            .style('fill', '#000')
            .style('font-weight', '700')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 0 3px rgba(255,255,255,0.8)');
          
          // Time range (subtitle)
          const timeText = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
          bar.append('text')
            .attr('x', x + 10)
            .attr('y', y + barHeight / 2 + 8)
            .text(timeText)
            .style('font-size', '10px')
            .style('fill', '#000')
            .style('font-weight', '600')
            .style('opacity', 0.8)
            .style('pointer-events', 'none')
            .style('text-shadow', '0 0 2px rgba(255,255,255,0.8)');
        } else if (barWidth > 60) {
          // Medium bars - single line
          const text = schedule.operation || schedule.name || 'Schedule';
          const maxLength = Math.floor((barWidth - 10) / 6);
          
          bar.append('text')
            .attr('x', x + barWidth / 2)
            .attr('y', y + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(text.length > maxLength ? text.substring(0, maxLength - 2) + '...' : text)
            .style('font-size', '11px')
            .style('fill', '#000')
            .style('font-weight', '700')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 0 3px rgba(255,255,255,0.9)');
        } else if (barWidth > 30) {
          // Small bars - initials only
          const text = (schedule.operation || schedule.name || '??').substring(0, 3);
          bar.append('text')
            .attr('x', x + barWidth / 2)
            .attr('y', y + barHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(text)
            .style('font-size', '10px')
            .style('fill', '#000')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .style('text-shadow', '0 0 2px rgba(255,255,255,1)');
        }

        // Enhanced tooltip with full information
        const tooltipLines = [
          `🚢 ${schedule.shipVisit?.vesselName || 'N/A'}`,
          `📋 ${schedule.operation || 'Schedule'}`,
          `📊 Status: ${schedule.status}`,
          schedule.priority ? `⭐ Priority: ${schedule.priority}/10` : '',
          `🕐 Start: ${format(startTime, 'PPpp')}`,
          `🕐 End: ${format(endTime, 'PPpp')}`,
          schedule.completionPercentage ? `✓ Progress: ${schedule.completionPercentage}%` : '',
          schedule.resources?.berthName ? `⚓ Berth: ${schedule.resources.berthName}` : '',
          schedule.resources?.cranes?.length ? `🏗️ Cranes: ${schedule.resources.cranes.length}` : '',
          schedule.notes ? `📝 ${schedule.notes}` : '',
        ].filter(Boolean);

        bar.append('title')
          .text(tooltipLines.join('\n'));
      });
    });

    // Add current time indicator
    if (now >= startDate && now <= endDate) {
      const nowPosition = xScale(clampDateToRange(now));

      g.append('line')
        .attr('class', 'current-time')
        .attr('x1', nowPosition)
        .attr('x2', nowPosition)
        .attr('y1', 0)
        .attr('y2', totalHeight)
        .attr('stroke', '#f44336')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // Add current time label
      g.append('text')
        .attr('x', nowPosition)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .text('Now')
        .style('fill', '#f44336')
        .style('font-size', '12px')
        .style('font-weight', 'bold');
    }

  }, [schedules, viewMode, zoom, height, onScheduleClick]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleFit = () => {
    setZoom(1);
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header with Title and Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
            📊 Lịch Trình Tổng Quan (Gantt Chart)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.total} lịch trình • {stats.ships} tàu • {stats.inProgress} đang thực hiện
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="day">
              <Tooltip title="Xem theo ngày">
                <DayIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="week">
              <Tooltip title="Xem theo tuần">
                <WeekIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="month">
              <Tooltip title="Xem theo tháng">
                <MonthIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Zoom Controls */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Phóng to">
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Thu nhỏ">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vừa màn hình">
              <IconButton size="small" onClick={handleFit}>
                <FitIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Chip label={`${Math.round(zoom * 100)}%`} size="small" color="primary" />
        </Box>
      </Box>

      {/* Legend - improved colors */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Chip label="⏳ Pending" size="small" sx={{ bgcolor: '#FFA726', color: '#fff', fontWeight: 600 }} />
        <Chip label="📅 Scheduled" size="small" sx={{ bgcolor: '#42A5F5', color: '#fff', fontWeight: 600 }} />
        <Chip label="▶️ In Progress" size="small" sx={{ bgcolor: '#66BB6A', color: '#fff', fontWeight: 600 }} />
        <Chip label="✅ Completed" size="small" sx={{ bgcolor: '#BDBDBD', color: '#fff', fontWeight: 600 }} />
        <Chip label="❌ Cancelled" size="small" sx={{ bgcolor: '#EF5350', color: '#fff', fontWeight: 600 }} />
      </Box>

      {/* Gantt Chart SVG */}
      <Box
        ref={containerRef}
        sx={{
          overflow: 'auto',
          border: '2px solid #e3f2fd',
          borderRadius: 2,
          bgcolor: '#fafafa',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <svg ref={svgRef} style={{ display: 'block' }} />
      </Box>

      {schedules.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📭 Không có lịch trình
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chưa có lịch trình nào để hiển thị trong khoảng thời gian này
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GanttChart;

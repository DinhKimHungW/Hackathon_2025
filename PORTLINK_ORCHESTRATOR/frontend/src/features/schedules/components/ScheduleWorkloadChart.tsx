import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';
import { format } from 'date-fns';
import type { Schedule, Task } from '../types';

interface ScheduleWorkloadChartProps {
  schedules: Schedule[];
  startDate: Date;
  endDate: Date;
  height?: number;
}

type ResourceUtilization = {
  resourceId: string;
  resourceName: string;
  timePoints: Array<{
    time: Date;
    utilization: number;
    tasks: Task[];
  }>;
};

export const ScheduleWorkloadChart: React.FC<ScheduleWorkloadChartProps> = ({
  schedules,
  startDate,
  endDate,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate resource utilization over time
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup dimensions
    const margin = { top: 40, right: 30, bottom: 30, left: 150 };
    const width = container.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Extract all tasks and group by resource
    const resourceMap = new Map<string, Task[]>();
    schedules.forEach((schedule) => {
      schedule.tasks?.forEach((task) => {
        if (!task.assetId) return;
        if (!resourceMap.has(task.assetId)) {
          resourceMap.set(task.assetId, []);
        }
        resourceMap.get(task.assetId)!.push(task);
      });
    });

    // Calculate utilization for each resource over time
    const timePoints = d3.timeDay.range(startDate, endDate);
    const resourceUtilization: ResourceUtilization[] = Array.from(resourceMap.entries()).map(
      ([resourceId, tasks]) => ({
        resourceId,
        resourceName: tasks[0]?.asset?.name || resourceId,
        timePoints: timePoints.map((time) => {
          const dayTasks = tasks.filter((task) => {
            const taskStart = new Date(task.startTime);
            const taskEnd = new Date(task.endTime);
            return taskStart <= time && taskEnd >= time;
          });
          const utilization = dayTasks.length; // Simplified - could be more complex based on task duration/overlap
          return { time, utilization, tasks: dayTasks };
        }),
      })
    );

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);

    const maxUtilization = d3.max(resourceUtilization, (r) =>
      d3.max(r.timePoints, (d) => d.utilization)
    );

    const yScale = d3
      .scaleBand()
      .domain(resourceUtilization.map((r) => r.resourceId))
      .range([0, chartHeight])
      .padding(0.1);

    const colorScale = d3
      .scaleSequential()
      .domain([0, maxUtilization || 1])
      .interpolator(d3.interpolateBlues);

    // Create main group
    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add time axis
    const xAxis = d3
      .axisTop(xScale)
      .ticks(width / 80)
      .tickFormat((d) => format(d as Date, 'MMM d'));

    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Add resource axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
      const resource = resourceUtilization.find((r) => r.resourceId === d);
      return resource?.resourceName || d;
    });

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Draw utilization grid
    resourceUtilization.forEach((resource) => {
      resource.timePoints.forEach((point, i) => {
        if (i === resource.timePoints.length - 1) return; // Skip last point

        const x = xScale(point.time);
        const width = xScale(resource.timePoints[i + 1].time) - x;
        const y = yScale(resource.resourceId)!;

        const cell = g
          .append('g')
          .attr('class', 'utilization-cell')
          .attr('transform', `translate(${x},${y})`);

        // Background
        cell
          .append('rect')
          .attr('width', width)
          .attr('height', yScale.bandwidth())
          .attr('fill', colorScale(point.utilization))
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);

        // Label (if enough space)
        if (point.utilization > 0 && width > 24) {
          cell
            .append('text')
            .attr('x', width / 2)
            .attr('y', yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .style('fill', point.utilization > 2 ? '#fff' : '#000')
            .style('font-size', '11px')
            .text(point.utilization);
        }

        // Tooltip
        const tooltip = `${resource.resourceName}
Date: ${format(point.time, 'PPP')}
Tasks: ${point.utilization}
${point.tasks.map((t) => `• ${t.taskName || 'Untitled Task'}`).join('\n')}`;

        cell.append('title').text(tooltip);
      });
    });

    // Add current time indicator
    const now = new Date();
    if (now >= startDate && now <= endDate) {
      const x = xScale(now);
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', '#f44336')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4');
    }
  }, [schedules, startDate, endDate, height]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Resource Workload
      </Typography>
      <Box ref={containerRef}>
        <svg ref={svgRef} />
      </Box>
    </Paper>
  );
};
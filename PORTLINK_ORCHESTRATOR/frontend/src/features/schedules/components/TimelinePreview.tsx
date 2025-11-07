import React, { useEffect, useRef } from 'react';
import { Box, Tooltip } from '@mui/material';
import * as d3 from 'd3';
import type { Task } from '../types';
import { format } from 'date-fns';

interface TimelinePreviewProps {
  startTime: string | Date;
  endTime: string | Date;
  tasks: Task[];
  width: number;
  height: number;
  showLabels?: boolean;
}

const getTaskColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '#ff9800';
    case 'IN_PROGRESS':
      return '#4caf50';
    case 'COMPLETED':
      return '#9e9e9e';
    case 'CANCELLED':
      return '#f44336';
    default:
      return '#2196f3';
  }
};

export const TimelinePreview: React.FC<TimelinePreviewProps> = ({
  startTime,
  endTime,
  tasks,
  width,
  height,
  showLabels = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tasks?.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Convert dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain([start, end])
      .range([0, width]);

    // Group tasks by resource
    const resourceGroups = tasks.reduce((acc, task) => {
      const resourceId = task.assetId || 'unassigned';
      if (!acc[resourceId]) {
        acc[resourceId] = [];
      }
      acc[resourceId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const resources = Object.keys(resourceGroups);
    const rowHeight = height / (resources.length || 1);
    const barHeight = Math.min(rowHeight * 0.8, 16);

    // Draw tasks
    resources.forEach((resourceId, resourceIndex) => {
      const resourceTasks = resourceGroups[resourceId];
      const y = resourceIndex * rowHeight + (rowHeight - barHeight) / 2;

      resourceTasks.forEach((task) => {
        const taskStart = new Date(task.startTime);
        const taskEnd = new Date(task.endTime);
        const x = xScale(taskStart);
        const taskWidth = xScale(taskEnd) - x;

        const g = svg
          .append('g')
          .attr('class', 'task')
          .attr('transform', `translate(${x},${y})`);

        // Task bar
        g.append('rect')
          .attr('width', Math.max(taskWidth, 2))
          .attr('height', barHeight)
          .attr('rx', 2)
          .attr('fill', getTaskColor(task.status))
          .attr('opacity', 0.8);

        // Task label (if space allows)
        if (showLabels && taskWidth > 50) {
          g.append('text')
            .attr('x', 4)
            .attr('y', barHeight / 2)
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .style('font-size', '10px')
            .text(task.taskName || 'Task');
        }

        // Add tooltip
        const tooltip = `${task.taskName || 'Task'}
Status: ${task.status}
Start: ${format(taskStart, 'PPp')}
End: ${format(taskEnd, 'PPp')}`;

        g.append('title').text(tooltip);
      });
    });

    // Current time indicator
    if (now >= start && now <= end) {
      const x = xScale(now);
      svg
        .append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#f44336')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,2');
    }
  }, [startTime, endTime, tasks, width, height, showLabels]);

  return (
    <Box sx={{ width }}>
      <svg ref={svgRef} width={width} height={height} />
    </Box>
  );
};
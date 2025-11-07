import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';
import { format } from 'date-fns';
import type { Schedule, Task } from '../types';

interface ScheduleDependencyGraphProps {
  schedules: Schedule[];
  height?: number;
}

type Node = {
  id: string;
  label: string;
  type: 'schedule' | 'task' | 'resource';
  status: string;
  data: Schedule | Task;
};

type Link = {
  source: string;
  target: string;
  type: 'dependency' | 'resource' | 'schedule';
};

export const ScheduleDependencyGraph: React.FC<ScheduleDependencyGraphProps> = ({
  schedules,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !schedules.length) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create nodes and links
    const nodes: Node[] = [];
    const links: Link[] = [];
    const resourceNodes = new Map<string, Node>();

    // Add schedule nodes
    schedules.forEach((schedule) => {
      nodes.push({
        id: schedule.id,
        label: schedule.operation || 'Schedule',
        type: 'schedule',
        status: schedule.status,
        data: schedule,
      });

      // Add task nodes and links
      schedule.tasks?.forEach((task) => {
        nodes.push({
          id: task.id,
          label: task.taskName || 'Task',
          type: 'task',
          status: task.status,
          data: task,
        });

        // Link task to schedule
        links.push({
          source: schedule.id,
          target: task.id,
          type: 'schedule',
        });

        // Add resource node if not exists
        if (task.assetId && !resourceNodes.has(task.assetId)) {
          const resourceNode: Node = {
            id: task.assetId,
            label: task.asset?.name || 'Resource',
            type: 'resource',
            status: 'active',
            data: task.asset,
          };
          nodes.push(resourceNode);
          resourceNodes.set(task.assetId, resourceNode);
        }

        // Link task to resource
        if (task.assetId) {
          links.push({
            source: task.id,
            target: task.assetId,
            type: 'resource',
          });
        }

        // Add dependency links
        task.dependencies?.forEach((depId) => {
          links.push({
            source: depId,
            target: task.id,
            type: 'dependency',
          });
        });
      });
    });

    // Setup force simulation
    const width = container.clientWidth;
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create SVG elements
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Define arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => {
        switch (d.type) {
          case 'dependency':
            return '#f44336';
          case 'resource':
            return '#2196f3';
          default:
            return '#999';
        }
      })
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Create nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'schedule' ? 20 : 15))
      .attr('fill', (d) => {
        switch (d.type) {
          case 'schedule':
            return '#673ab7';
          case 'task':
            return '#2196f3';
          case 'resource':
            return '#4caf50';
          default:
            return '#999';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Node labels
    node
      .append('text')
      .text((d) => d.label)
      .attr('x', 0)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666');

    // Add tooltips
    node.append('title').text((d) => {
      switch (d.type) {
        case 'schedule':
          const schedule = d.data as Schedule;
          return `Schedule: ${schedule.operation}
Status: ${schedule.status}
Start: ${format(new Date(schedule.startTime), 'PPp')}
End: ${format(new Date(schedule.endTime), 'PPp')}`;
        case 'task':
          const task = d.data as Task;
          return `Task: ${task.taskName}
Status: ${task.status}
Start: ${format(new Date(task.startTime), 'PPp')}
End: ${format(new Date(task.endTime), 'PPp')}`;
        default:
          return d.label;
      }
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [schedules, height]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Schedule Dependencies
      </Typography>
      <Box ref={containerRef}>
        <svg ref={svgRef} />
      </Box>
    </Paper>
  );
};
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Paper, IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import type { PortLayout, Berth, Crane, Ship, Zone } from '../../types/portLayout';

interface PortLayoutCanvasProps {
  portLayout: PortLayout;
  showHeatmap?: boolean;
  onBerthClick?: (berth: Berth) => void;
  onShipClick?: (ship: Ship) => void;
  onCraneClick?: (crane: Crane) => void;
}

const PortLayoutCanvas: React.FC<PortLayoutCanvasProps> = ({
  portLayout,
  showHeatmap = false,
  onBerthClick,
  onShipClick,
  onCraneClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [activeLayer, setActiveLayer] = useState<string[]>(['berths', 'ships', 'cranes', 'zones']);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const initialTransformRef = useRef<d3.ZoomTransform | null>(null);

  // Status color mappings
  const berthStatusColors = {
    AVAILABLE: '#4caf50',
    OCCUPIED: '#2196f3',
    RESERVED: '#ff9800',
    MAINTENANCE: '#f44336',
  };

  const craneStatusColors = {
    AVAILABLE: '#4caf50',
    IN_USE: '#2196f3',
    MAINTENANCE: '#ff9800',
    OUT_OF_SERVICE: '#f44336',
  };

  // Responsive resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Main D3.js rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate scale to fit port layout
    const scaleX = dimensions.width / portLayout.dimensions.width;
    const scaleY = dimensions.height / portLayout.dimensions.height;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    // Create main group with zoom behavior
    const g = svg.append('g').attr('class', 'port-layout-group');

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Initial transform to center the port
    const initialTransform = d3.zoomIdentity
      .translate(
        (dimensions.width - portLayout.dimensions.width * scale) / 2,
        (dimensions.height - portLayout.dimensions.height * scale) / 2
      )
      .scale(scale);

    initialTransformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    // Background water
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', portLayout.dimensions.width)
      .attr('height', portLayout.dimensions.height)
      .attr('fill', '#b3d9ff')
      .attr('opacity', 0.3);

    // Render zones (if enabled)
    if (activeLayer.includes('zones')) {
      renderZones(g, portLayout.zones);
    }

    // Render heatmap overlay (if enabled)
    if (showHeatmap && activeLayer.includes('zones')) {
      renderHeatmap(g, portLayout.zones);
    }

    // Render water areas
    renderWaterAreas(g);

    // Render berths (if enabled)
    if (activeLayer.includes('berths')) {
      renderBerths(g, portLayout.berths);
    }

    // Render ships (if enabled)
    if (activeLayer.includes('ships')) {
      renderShips(g, portLayout.ships);
    }

    // Render cranes (if enabled)
    if (activeLayer.includes('cranes')) {
      renderCranes(g, portLayout.cranes);
    }

    // Render landmarks
    renderLandmarks(g);

    // Store zoom behavior for controls
    (svg.node() as any).__zoom = zoom;
  }, [portLayout, dimensions, showHeatmap, activeLayer]);

  // Render zones
  const renderZones = (g: d3.Selection<SVGGElement, unknown, null, undefined>, zones: Zone[]) => {
    const zoneGroup = g.append('g').attr('class', 'zones');

    zones.forEach((zone) => {
      const zoneG = zoneGroup.append('g').attr('class', `zone zone-${zone.id}`);

      // Zone background
      zoneG
        .append('rect')
        .attr('x', zone.bounds.x)
        .attr('y', zone.bounds.y)
        .attr('width', zone.bounds.width)
        .attr('height', zone.bounds.height)
        .attr('fill', '#e0e0e0')
        .attr('opacity', 0.2)
        .attr('stroke', '#9e9e9e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // Zone label
      zoneG
        .append('text')
        .attr('x', zone.bounds.x + zone.bounds.width / 2)
        .attr('y', zone.bounds.y + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', '#616161')
        .text(zone.name);

      // Zone utilization text
      zoneG
        .append('text')
        .attr('x', zone.bounds.x + zone.bounds.width / 2)
        .attr('y', zone.bounds.y + 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#757575')
        .text(`${zone.utilization}% sử dụng`);
    });
  };

  // Render heatmap overlay
  const renderHeatmap = (g: d3.Selection<SVGGElement, unknown, null, undefined>, zones: Zone[]) => {
    const heatmapGroup = g.append('g').attr('class', 'heatmap');

    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, 50, 100])
      .range(['#4caf50', '#ff9800', '#f44336']);

    zones.forEach((zone) => {
      heatmapGroup
        .append('rect')
        .attr('x', zone.bounds.x)
        .attr('y', zone.bounds.y)
        .attr('width', zone.bounds.width)
        .attr('height', zone.bounds.height)
        .attr('fill', colorScale(zone.utilization))
        .attr('opacity', 0.3);
    });
  };

  // Render water areas
  const renderWaterAreas = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    const waterGroup = g.append('g').attr('class', 'water-areas');

    portLayout.waterAreas.forEach((water) => {
      const line = d3.line<{ x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y);

      waterGroup
        .append('path')
        .attr('d', line(water.path) || '')
        .attr('fill', water.type === 'CHANNEL' ? 'none' : '#1976d2')
        .attr('stroke', '#1976d2')
        .attr('stroke-width', water.type === 'CHANNEL' ? 4 : 2)
        .attr('stroke-dasharray', water.type === 'CHANNEL' ? '10,5' : 'none')
        .attr('opacity', 0.5);
    });
  };

  // Render berths
  const renderBerths = (g: d3.Selection<SVGGElement, unknown, null, undefined>, berths: Berth[]) => {
    const berthGroup = g.append('g').attr('class', 'berths');

    berths.forEach((berth) => {
      const berthG = berthGroup.append('g').attr('class', `berth berth-${berth.id}`);

      // Berth rectangle
      berthG
        .append('rect')
        .attr('x', berth.position.x)
        .attr('y', berth.position.y)
        .attr('width', berth.dimensions.width)
        .attr('height', berth.dimensions.height)
        .attr('fill', berthStatusColors[berth.status])
        .attr('opacity', 0.7)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 5)
        .style('cursor', 'pointer')
        .on('click', () => onBerthClick?.(berth))
        .on('mouseenter', function () {
          d3.select(this).attr('opacity', 1).attr('stroke-width', 3);
          showTooltip(berth, 'berth');
        })
        .on('mouseleave', function () {
          d3.select(this).attr('opacity', 0.7).attr('stroke-width', 2);
          hideTooltip();
        });

      // Berth code label
      berthG
        .append('text')
        .attr('x', berth.position.x + berth.dimensions.width / 2)
        .attr('y', berth.position.y + berth.dimensions.height / 2 - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .text(berth.code);

      // Berth name
      berthG
        .append('text')
        .attr('x', berth.position.x + berth.dimensions.width / 2)
        .attr('y', berth.position.y + berth.dimensions.height / 2 + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', '#fff')
        .text(berth.name);

      // Utilization indicator
      if (berth.utilization > 0) {
        berthG
          .append('rect')
          .attr('x', berth.position.x)
          .attr('y', berth.position.y + berth.dimensions.height + 5)
          .attr('width', berth.dimensions.width)
          .attr('height', 8)
          .attr('fill', '#e0e0e0')
          .attr('rx', 4);

        berthG
          .append('rect')
          .attr('x', berth.position.x)
          .attr('y', berth.position.y + berth.dimensions.height + 5)
          .attr('width', (berth.dimensions.width * berth.utilization) / 100)
          .attr('height', 8)
          .attr('fill', '#ffc107')
          .attr('rx', 4);

        berthG
          .append('text')
          .attr('x', berth.position.x + berth.dimensions.width / 2)
          .attr('y', berth.position.y + berth.dimensions.height + 22)
          .attr('text-anchor', 'middle')
          .attr('font-size', 9)
          .attr('fill', '#333')
          .text(`${berth.utilization}%`);
      }
    });
  };

  // Render ships
  const renderShips = (g: d3.Selection<SVGGElement, unknown, null, undefined>, ships: Ship[]) => {
    const shipGroup = g.append('g').attr('class', 'ships');

    ships.forEach((ship) => {
      const shipG = shipGroup.append('g').attr('class', `ship ship-${ship.id}`);

      // Ship hull (simplified polygon)
      const shipPath = `
        M ${ship.position.x - ship.length / 12} ${ship.position.y}
        L ${ship.position.x + ship.length / 12} ${ship.position.y - ship.width / 4}
        L ${ship.position.x + ship.length / 12} ${ship.position.y + ship.width / 4}
        Z
      `;

      shipG
        .append('path')
        .attr('d', shipPath)
        .attr('fill', '#1a237e')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => onShipClick?.(ship))
        .on('mouseenter', function () {
          d3.select(this).attr('fill', '#283593');
          showTooltip(ship, 'ship');
        })
        .on('mouseleave', function () {
          d3.select(this).attr('fill', '#1a237e');
          hideTooltip();
        });

      // Ship name label
      shipG
        .append('text')
        .attr('x', ship.position.x)
        .attr('y', ship.position.y - ship.width / 2 - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('font-weight', 'bold')
        .attr('fill', '#1a237e')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .text(ship.name);
    });
  };

  // Render cranes
  const renderCranes = (g: d3.Selection<SVGGElement, unknown, null, undefined>, cranes: Crane[]) => {
    const craneGroup = g.append('g').attr('class', 'cranes');

    cranes.forEach((crane) => {
      const craneG = craneGroup.append('g').attr('class', `crane crane-${crane.id}`);

      // Crane base
      craneG
        .append('circle')
        .attr('cx', crane.position.x)
        .attr('cy', crane.position.y)
        .attr('r', 12)
        .attr('fill', craneStatusColors[crane.status])
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', () => onCraneClick?.(crane))
        .on('mouseenter', function () {
          d3.select(this).attr('r', 15);
          showTooltip(crane, 'crane');
        })
        .on('mouseleave', function () {
          d3.select(this).attr('r', 12);
          hideTooltip();
        });

      // Crane boom
      craneG
        .append('line')
        .attr('x1', crane.position.x)
        .attr('y1', crane.position.y)
        .attr('x2', crane.position.x)
        .attr('y2', crane.position.y - 30)
        .attr('stroke', '#333')
        .attr('stroke-width', 3);

      // Crane code
      craneG
        .append('text')
        .attr('x', crane.position.x)
        .attr('y', crane.position.y + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9)
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(crane.code);
    });
  };

  // Render landmarks
  const renderLandmarks = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    const landmarkGroup = g.append('g').attr('class', 'landmarks');

    portLayout.landmarks.forEach((landmark) => {
      const landmarkG = landmarkGroup.append('g').attr('class', `landmark landmark-${landmark.id}`);

      if (landmark.dimensions) {
        landmarkG
          .append('rect')
          .attr('x', landmark.position.x)
          .attr('y', landmark.position.y)
          .attr('width', landmark.dimensions.width)
          .attr('height', landmark.dimensions.height)
          .attr('fill', '#757575')
          .attr('opacity', 0.5)
          .attr('stroke', '#424242')
          .attr('stroke-width', 1);

        landmarkG
          .append('text')
          .attr('x', landmark.position.x + landmark.dimensions.width / 2)
          .attr('y', landmark.position.y + landmark.dimensions.height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('fill', '#fff')
          .text(landmark.name);
      }
    });
  };

  // Tooltip functions
  const showTooltip = (data: Berth | Ship | Crane, type: string) => {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'port-map-tooltip')
      .style('position', 'absolute')
      .style('background', '#333')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', 10000);

    if (type === 'berth') {
      const berth = data as Berth;
      tooltip.html(`
        <strong>${berth.name}</strong><br/>
        Mã: ${berth.code}<br/>
        Trạng thái: ${berth.status}<br/>
        ${berth.currentShip ? `Tàu: ${berth.currentShip.name}` : 'Trống'}
      `);
    } else if (type === 'ship') {
      const ship = data as Ship;
      tooltip.html(`
        <strong>${ship.name}</strong><br/>
        Loại: ${ship.type}<br/>
        Kích thước: ${ship.length}m x ${ship.width}m<br/>
        Trạng thái: ${ship.status}
      `);
    } else if (type === 'crane') {
      const crane = data as Crane;
      tooltip.html(`
        <strong>${crane.name}</strong><br/>
        Mã: ${crane.code}<br/>
        Loại: ${crane.type}<br/>
        Trạng thái: ${crane.status}
      `);
    }

    d3.select('body').on('mousemove', (event) => {
      tooltip
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY + 10}px`);
    });
  };

  const hideTooltip = () => {
    d3.selectAll('.port-map-tooltip').remove();
    d3.select('body').on('mousemove', null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3.select(svgRef.current);

      if (!initialTransformRef.current) {
        const scaleX = dimensions.width / portLayout.dimensions.width;
        const scaleY = dimensions.height / portLayout.dimensions.height;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        initialTransformRef.current = d3.zoomIdentity
          .translate(
            (dimensions.width - portLayout.dimensions.width * scale) / 2,
            (dimensions.height - portLayout.dimensions.height * scale) / 2
          )
          .scale(scale);
      }

      svg
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, initialTransformRef.current);
    }
  };

  const handleLayerToggle = (_event: React.MouseEvent<HTMLElement>, newLayers: string[]) => {
    setActiveLayer(newLayers);
  };

  return (
    <Paper sx={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      {/* Zoom Controls */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="Phóng to">
            <IconButton onClick={handleZoomIn} sx={{ bgcolor: 'background.paper' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Thu nhỏ">
            <IconButton onClick={handleZoomOut} sx={{ bgcolor: 'background.paper' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Đặt lại zoom">
            <IconButton onClick={handleResetZoom} sx={{ bgcolor: 'background.paper' }}>
              <CenterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Layer Controls */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}>
        <Paper sx={{ p: 1 }}>
          <ToggleButtonGroup
            value={activeLayer}
            onChange={handleLayerToggle}
            aria-label="layer controls"
            size="small"
            orientation="vertical"
          >
            <ToggleButton value="zones" aria-label="zones">
              <Tooltip title="Hiện khu vực">
                <LayersIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="berths" aria-label="berths">
              <Tooltip title="Hiện bến tàu">
                <Box sx={{ fontSize: 10, fontWeight: 'bold' }}>B</Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="ships" aria-label="ships">
              <Tooltip title="Hiện tàu">
                <Box sx={{ fontSize: 10, fontWeight: 'bold' }}>S</Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="cranes" aria-label="cranes">
              <Tooltip title="Hiện cẩu">
                <Box sx={{ fontSize: 10, fontWeight: 'bold' }}>C</Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Box>

      {/* SVG Canvas */}
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block' }}
        />
      </Box>
    </Paper>
  );
};

export default PortLayoutCanvas;

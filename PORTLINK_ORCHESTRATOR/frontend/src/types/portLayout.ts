/**
 * Port Layout Data Types
 * Defines the structure for port visualization including berths, cranes, ships, and zones
 */

export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Berth - A docking position for ships
 */
export interface Berth {
  id: string;
  code: string;
  name: string;
  position: Coordinates;
  dimensions: Dimensions;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  type: 'CONTAINER' | 'BULK' | 'TANKER' | 'GENERAL';
  maxDraft: number; // meters
  maxLength: number; // meters
  currentShip?: {
    id: string;
    name: string;
    arrivalTime: Date;
    departureTime?: Date;
  };
  utilization: number; // 0-100%
  zone: string;
}

/**
 * Crane - Equipment at berths
 */
export interface Crane {
  id: string;
  code: string;
  name: string;
  position: Coordinates;
  berthId: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  type: 'STS' | 'RTG' | 'MOBILE'; // Ship-to-Shore, Rubber-Tired Gantry, Mobile
  capacity: number; // tons
  currentTask?: {
    id: string;
    description: string;
    startTime: Date;
  };
}

/**
 * Ship - Vessel at port
 */
export interface Ship {
  id: string;
  name: string;
  type: 'CONTAINER' | 'BULK' | 'TANKER' | 'RORO' | 'GENERAL_CARGO';
  position: Coordinates;
  berthId?: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'IN_PROGRESS' | 'DEPARTED';
  length: number; // meters
  width: number; // meters
  draft: number; // meters
  eta?: Date;
  etd?: Date;
}

/**
 * Zone - Grouped area in port (for heatmap)
 */
export interface Zone {
  id: string;
  name: string;
  type: 'CONTAINER_TERMINAL' | 'BULK_TERMINAL' | 'TANKER_TERMINAL' | 'WAREHOUSE' | 'YARD';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  utilization: number; // 0-100%
  capacity: number;
  currentLoad: number;
}

/**
 * Port Layout Configuration
 */
export interface PortLayout {
  id: string;
  name: string;
  dimensions: Dimensions;
  berths: Berth[];
  cranes: Crane[];
  ships: Ship[];
  zones: Zone[];
  waterAreas: WaterArea[];
  landmarks: Landmark[];
}

/**
 * Water Area - Navigation channels, anchorage
 */
export interface WaterArea {
  id: string;
  name: string;
  type: 'CHANNEL' | 'ANCHORAGE' | 'TURNING_BASIN';
  path: Coordinates[]; // SVG path points
  depth: number; // meters
}

/**
 * Landmark - Buildings, gates, etc.
 */
export interface Landmark {
  id: string;
  name: string;
  type: 'GATE' | 'BUILDING' | 'WAREHOUSE' | 'OFFICE' | 'FUEL_STATION';
  position: Coordinates;
  dimensions?: Dimensions;
  icon?: string;
}

/**
 * Heatmap Data Point
 */
export interface HeatmapDataPoint {
  x: number;
  y: number;
  value: number; // 0-100%
  label?: string;
}

/**
 * Port Map View Settings
 */
export interface PortMapSettings {
  showBerths: boolean;
  showShips: boolean;
  showCranes: boolean;
  showZones: boolean;
  showHeatmap: boolean;
  showLabels: boolean;
  showGrid: boolean;
  zoomLevel: number;
  centerPosition: Coordinates;
}

/**
 * Mock Port Layout Data for Cat Lai Port (Cảng Cát Lái)
 * - 9 container berths (bến đón tàu container)
 * - 1 barge berth (bến sà lan)
 * - 26 quay cranes (cẩu bờ)
 * - Multiple zones: container terminals, barge area, warehouse, rice storage, customs inspection
 */
export const MOCK_PORT_LAYOUT: PortLayout = {
  id: 'catlai-port',
  name: 'Cảng Cát Lái - TP.HCM',
  dimensions: {
    width: 3000,
    height: 1600,
  },
  berths: [
    // Container Berths (9 bến container)
    {
      id: 'berth-ct1',
      code: 'CT1',
      name: 'Bến Container 1',
      position: { x: 200, y: 400 },
      dimensions: { width: 280, height: 60 },
      status: 'OCCUPIED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      currentShip: {
        id: 'ship-1',
        name: 'COSCO SHIPPING VIRGO',
        arrivalTime: new Date('2025-11-03T06:00:00'),
        departureTime: new Date('2025-11-04T22:00:00'),
      },
      utilization: 90,
      zone: 'zone-container-a',
    },
    {
      id: 'berth-ct2',
      code: 'CT2',
      name: 'Bến Container 2',
      position: { x: 200, y: 480 },
      dimensions: { width: 280, height: 60 },
      status: 'OCCUPIED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      currentShip: {
        id: 'ship-2',
        name: 'MSC OSCAR',
        arrivalTime: new Date('2025-11-02T14:00:00'),
        departureTime: new Date('2025-11-05T08:00:00'),
      },
      utilization: 85,
      zone: 'zone-container-a',
    },
    {
      id: 'berth-ct3',
      code: 'CT3',
      name: 'Bến Container 3',
      position: { x: 200, y: 560 },
      dimensions: { width: 280, height: 60 },
      status: 'AVAILABLE',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      utilization: 0,
      zone: 'zone-container-a',
    },
    {
      id: 'berth-ct4',
      code: 'CT4',
      name: 'Bến Container 4',
      position: { x: 600, y: 400 },
      dimensions: { width: 280, height: 60 },
      status: 'OCCUPIED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      currentShip: {
        id: 'ship-3',
        name: 'EVER GOLDEN',
        arrivalTime: new Date('2025-11-03T10:00:00'),
      },
      utilization: 75,
      zone: 'zone-container-b',
    },
    {
      id: 'berth-ct5',
      code: 'CT5',
      name: 'Bến Container 5',
      position: { x: 600, y: 480 },
      dimensions: { width: 280, height: 60 },
      status: 'RESERVED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      utilization: 0,
      zone: 'zone-container-b',
    },
    {
      id: 'berth-ct6',
      code: 'CT6',
      name: 'Bến Container 6',
      position: { x: 600, y: 560 },
      dimensions: { width: 280, height: 60 },
      status: 'OCCUPIED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      currentShip: {
        id: 'ship-4',
        name: 'MAERSK EINDHOVEN',
        arrivalTime: new Date('2025-11-01T08:00:00'),
        departureTime: new Date('2025-11-03T18:00:00'),
      },
      utilization: 95,
      zone: 'zone-container-b',
    },
    {
      id: 'berth-ct7',
      code: 'CT7',
      name: 'Bến Container 7',
      position: { x: 1000, y: 400 },
      dimensions: { width: 280, height: 60 },
      status: 'AVAILABLE',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      utilization: 0,
      zone: 'zone-container-c',
    },
    {
      id: 'berth-ct8',
      code: 'CT8',
      name: 'Bến Container 8',
      position: { x: 1000, y: 480 },
      dimensions: { width: 280, height: 60 },
      status: 'OCCUPIED',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      currentShip: {
        id: 'ship-5',
        name: 'ONE COMMITMENT',
        arrivalTime: new Date('2025-11-03T12:00:00'),
      },
      utilization: 70,
      zone: 'zone-container-c',
    },
    {
      id: 'berth-ct9',
      code: 'CT9',
      name: 'Bến Container 9',
      position: { x: 1000, y: 560 },
      dimensions: { width: 280, height: 60 },
      status: 'MAINTENANCE',
      type: 'CONTAINER',
      maxDraft: 14.5,
      maxLength: 366,
      utilization: 0,
      zone: 'zone-container-c',
    },
    // Barge Berth (1 bến sà lan)
    {
      id: 'berth-barge1',
      code: 'BG1',
      name: 'Bến Sà Lan',
      position: { x: 1500, y: 400 },
      dimensions: { width: 150, height: 50 },
      status: 'OCCUPIED',
      type: 'GENERAL',
      maxDraft: 8,
      maxLength: 120,
      currentShip: {
        id: 'ship-barge1',
        name: 'SÀ LAN ĐỒNG NAI 01',
        arrivalTime: new Date('2025-11-03T07:00:00'),
      },
      utilization: 60,
      zone: 'zone-barge',
    },
  ],
  cranes: [
    // Berth CT1 - 3 cranes
    {
      id: 'crane-ct1-1',
      code: 'STS-01',
      name: 'Cẩu Bờ CT1-1',
      position: { x: 240, y: 380 },
      berthId: 'berth-ct1',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
      currentTask: {
        id: 'task-1',
        description: 'Dỡ container COSCO SHIPPING VIRGO',
        startTime: new Date('2025-11-03T07:00:00'),
      },
    },
    {
      id: 'crane-ct1-2',
      code: 'STS-02',
      name: 'Cẩu Bờ CT1-2',
      position: { x: 340, y: 380 },
      berthId: 'berth-ct1',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
      currentTask: {
        id: 'task-2',
        description: 'Dỡ container COSCO SHIPPING VIRGO',
        startTime: new Date('2025-11-03T07:30:00'),
      },
    },
    {
      id: 'crane-ct1-3',
      code: 'STS-03',
      name: 'Cẩu Bờ CT1-3',
      position: { x: 440, y: 380 },
      berthId: 'berth-ct1',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT2 - 3 cranes
    {
      id: 'crane-ct2-1',
      code: 'STS-04',
      name: 'Cẩu Bờ CT2-1',
      position: { x: 240, y: 460 },
      berthId: 'berth-ct2',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
      currentTask: {
        id: 'task-3',
        description: 'Xếp container MSC OSCAR',
        startTime: new Date('2025-11-03T08:00:00'),
      },
    },
    {
      id: 'crane-ct2-2',
      code: 'STS-05',
      name: 'Cẩu Bờ CT2-2',
      position: { x: 340, y: 460 },
      berthId: 'berth-ct2',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct2-3',
      code: 'STS-06',
      name: 'Cẩu Bờ CT2-3',
      position: { x: 440, y: 460 },
      berthId: 'berth-ct2',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT3 - 3 cranes
    {
      id: 'crane-ct3-1',
      code: 'STS-07',
      name: 'Cẩu Bờ CT3-1',
      position: { x: 240, y: 540 },
      berthId: 'berth-ct3',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct3-2',
      code: 'STS-08',
      name: 'Cẩu Bờ CT3-2',
      position: { x: 340, y: 540 },
      berthId: 'berth-ct3',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct3-3',
      code: 'STS-09',
      name: 'Cẩu Bờ CT3-3',
      position: { x: 440, y: 540 },
      berthId: 'berth-ct3',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT4 - 3 cranes
    {
      id: 'crane-ct4-1',
      code: 'STS-10',
      name: 'Cẩu Bờ CT4-1',
      position: { x: 640, y: 380 },
      berthId: 'berth-ct4',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct4-2',
      code: 'STS-11',
      name: 'Cẩu Bờ CT4-2',
      position: { x: 740, y: 380 },
      berthId: 'berth-ct4',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct4-3',
      code: 'STS-12',
      name: 'Cẩu Bờ CT4-3',
      position: { x: 840, y: 380 },
      berthId: 'berth-ct4',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT5 - 3 cranes
    {
      id: 'crane-ct5-1',
      code: 'STS-13',
      name: 'Cẩu Bờ CT5-1',
      position: { x: 640, y: 460 },
      berthId: 'berth-ct5',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct5-2',
      code: 'STS-14',
      name: 'Cẩu Bờ CT5-2',
      position: { x: 740, y: 460 },
      berthId: 'berth-ct5',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct5-3',
      code: 'STS-15',
      name: 'Cẩu Bờ CT5-3',
      position: { x: 840, y: 460 },
      berthId: 'berth-ct5',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT6 - 3 cranes
    {
      id: 'crane-ct6-1',
      code: 'STS-16',
      name: 'Cẩu Bờ CT6-1',
      position: { x: 640, y: 540 },
      berthId: 'berth-ct6',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct6-2',
      code: 'STS-17',
      name: 'Cẩu Bờ CT6-2',
      position: { x: 740, y: 540 },
      berthId: 'berth-ct6',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct6-3',
      code: 'STS-18',
      name: 'Cẩu Bờ CT6-3',
      position: { x: 840, y: 540 },
      berthId: 'berth-ct6',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT7 - 2 cranes
    {
      id: 'crane-ct7-1',
      code: 'STS-19',
      name: 'Cẩu Bờ CT7-1',
      position: { x: 1080, y: 380 },
      berthId: 'berth-ct7',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct7-2',
      code: 'STS-20',
      name: 'Cẩu Bờ CT7-2',
      position: { x: 1180, y: 380 },
      berthId: 'berth-ct7',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT8 - 3 cranes
    {
      id: 'crane-ct8-1',
      code: 'STS-21',
      name: 'Cẩu Bờ CT8-1',
      position: { x: 1040, y: 460 },
      berthId: 'berth-ct8',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct8-2',
      code: 'STS-22',
      name: 'Cẩu Bờ CT8-2',
      position: { x: 1140, y: 460 },
      berthId: 'berth-ct8',
      status: 'IN_USE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct8-3',
      code: 'STS-23',
      name: 'Cẩu Bờ CT8-3',
      position: { x: 1240, y: 460 },
      berthId: 'berth-ct8',
      status: 'AVAILABLE',
      type: 'STS',
      capacity: 65,
    },
    // Berth CT9 - 3 cranes
    {
      id: 'crane-ct9-1',
      code: 'STS-24',
      name: 'Cẩu Bờ CT9-1',
      position: { x: 1040, y: 540 },
      berthId: 'berth-ct9',
      status: 'MAINTENANCE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct9-2',
      code: 'STS-25',
      name: 'Cẩu Bờ CT9-2',
      position: { x: 1140, y: 540 },
      berthId: 'berth-ct9',
      status: 'MAINTENANCE',
      type: 'STS',
      capacity: 65,
    },
    {
      id: 'crane-ct9-3',
      code: 'STS-26',
      name: 'Cẩu Bờ CT9-3',
      position: { x: 1240, y: 540 },
      berthId: 'berth-ct9',
      status: 'MAINTENANCE',
      type: 'STS',
      capacity: 65,
    },
  ],
  ships: [
    {
      id: 'ship-1',
      name: 'COSCO SHIPPING VIRGO',
      type: 'CONTAINER',
      position: { x: 340, y: 430 },
      berthId: 'berth-ct1',
      status: 'IN_PROGRESS',
      length: 366,
      width: 51,
      draft: 14,
      eta: new Date('2025-11-03T06:00:00'),
      etd: new Date('2025-11-04T22:00:00'),
    },
    {
      id: 'ship-2',
      name: 'MSC OSCAR',
      type: 'CONTAINER',
      position: { x: 340, y: 510 },
      berthId: 'berth-ct2',
      status: 'IN_PROGRESS',
      length: 366,
      width: 51,
      draft: 14,
      eta: new Date('2025-11-02T14:00:00'),
      etd: new Date('2025-11-05T08:00:00'),
    },
    {
      id: 'ship-3',
      name: 'EVER GOLDEN',
      type: 'CONTAINER',
      position: { x: 740, y: 430 },
      berthId: 'berth-ct4',
      status: 'IN_PROGRESS',
      length: 334,
      width: 48,
      draft: 13.5,
      eta: new Date('2025-11-03T10:00:00'),
      etd: new Date('2025-11-04T16:00:00'),
    },
    {
      id: 'ship-4',
      name: 'MAERSK EINDHOVEN',
      type: 'CONTAINER',
      position: { x: 740, y: 590 },
      berthId: 'berth-ct6',
      status: 'IN_PROGRESS',
      length: 347,
      width: 48,
      draft: 14,
      eta: new Date('2025-11-01T08:00:00'),
      etd: new Date('2025-11-03T18:00:00'),
    },
    {
      id: 'ship-5',
      name: 'ONE COMMITMENT',
      type: 'CONTAINER',
      position: { x: 1140, y: 510 },
      berthId: 'berth-ct8',
      status: 'IN_PROGRESS',
      length: 300,
      width: 43,
      draft: 13,
      eta: new Date('2025-11-03T12:00:00'),
      etd: new Date('2025-11-04T20:00:00'),
    },
    {
      id: 'ship-barge1',
      name: 'SÀ LAN ĐỒNG NAI 01',
      type: 'GENERAL_CARGO',
      position: { x: 1575, y: 425 },
      berthId: 'berth-barge1',
      status: 'IN_PROGRESS',
      length: 80,
      width: 15,
      draft: 5,
      eta: new Date('2025-11-03T07:00:00'),
      etd: new Date('2025-11-03T17:00:00'),
    },
  ],
  zones: [
    {
      id: 'zone-container-a',
      name: 'Khu Container Terminal A',
      type: 'CONTAINER_TERMINAL',
      bounds: { x: 150, y: 350, width: 380, height: 300 },
      utilization: 85,
      capacity: 50000,
      currentLoad: 42500,
    },
    {
      id: 'zone-container-b',
      name: 'Khu Container Terminal B',
      type: 'CONTAINER_TERMINAL',
      bounds: { x: 550, y: 350, width: 380, height: 300 },
      utilization: 78,
      capacity: 50000,
      currentLoad: 39000,
    },
    {
      id: 'zone-container-c',
      name: 'Khu Container Terminal C',
      type: 'CONTAINER_TERMINAL',
      bounds: { x: 950, y: 350, width: 380, height: 300 },
      utilization: 65,
      capacity: 50000,
      currentLoad: 32500,
    },
    {
      id: 'zone-barge',
      name: 'Khu Bến Sà Lan',
      type: 'CONTAINER_TERMINAL',
      bounds: { x: 1450, y: 350, width: 250, height: 150 },
      utilization: 60,
      capacity: 5000,
      currentLoad: 3000,
    },
    {
      id: 'zone-warehouse',
      name: 'Khu Kho Hàng',
      type: 'WAREHOUSE',
      bounds: { x: 150, y: 700, width: 600, height: 200 },
      utilization: 70,
      capacity: 100000,
      currentLoad: 70000,
    },
    {
      id: 'zone-rice',
      name: 'Khu Gạo',
      type: 'WAREHOUSE',
      bounds: { x: 800, y: 700, width: 400, height: 200 },
      utilization: 55,
      capacity: 50000,
      currentLoad: 27500,
    },
    {
      id: 'zone-customs',
      name: 'Khu Kiểm Hoá',
      type: 'WAREHOUSE',
      bounds: { x: 1250, y: 700, width: 350, height: 200 },
      utilization: 40,
      capacity: 20000,
      currentLoad: 8000,
    },
  ],
  waterAreas: [
    {
      id: 'channel-main',
      name: 'Luồng Hàng Hải Chính',
      type: 'CHANNEL',
      path: [
        { x: 0, y: 1000 },
        { x: 3000, y: 1000 },
      ],
      depth: 14.5,
    },
    {
      id: 'channel-approach',
      name: 'Luồng Tiếp Cận',
      type: 'CHANNEL',
      path: [
        { x: 0, y: 850 },
        { x: 1500, y: 850 },
      ],
      depth: 12,
    },
    {
      id: 'anchorage-outer',
      name: 'Khu Neo Ngoài',
      type: 'ANCHORAGE',
      path: [
        { x: 2000, y: 1100 },
        { x: 2800, y: 1100 },
        { x: 2800, y: 1500 },
        { x: 2000, y: 1500 },
      ],
      depth: 18,
    },
    {
      id: 'basin-turning',
      name: 'Bể Quay Tàu',
      type: 'TURNING_BASIN',
      path: [
        { x: 1400, y: 900 },
        { x: 1700, y: 900 },
        { x: 1700, y: 1100 },
        { x: 1400, y: 1100 },
      ],
      depth: 15,
    },
  ],
  landmarks: [
    {
      id: 'gate-main',
      name: 'Cổng Chính',
      type: 'GATE',
      position: { x: 100, y: 200 },
      dimensions: { width: 50, height: 40 },
    },
    {
      id: 'gate-container',
      name: 'Cổng Container',
      type: 'GATE',
      position: { x: 500, y: 200 },
      dimensions: { width: 40, height: 30 },
    },
    {
      id: 'office-port-authority',
      name: 'Văn Phòng Cảng Vụ',
      type: 'OFFICE',
      position: { x: 200, y: 150 },
      dimensions: { width: 100, height: 80 },
    },
    {
      id: 'office-customs',
      name: 'Văn Phòng Hải Quan',
      type: 'OFFICE',
      position: { x: 400, y: 150 },
      dimensions: { width: 90, height: 70 },
    },
    {
      id: 'warehouse-1',
      name: 'Kho CFS 1',
      type: 'WAREHOUSE',
      position: { x: 200, y: 750 },
      dimensions: { width: 150, height: 100 },
    },
    {
      id: 'warehouse-2',
      name: 'Kho CFS 2',
      type: 'WAREHOUSE',
      position: { x: 400, y: 750 },
      dimensions: { width: 150, height: 100 },
    },
    {
      id: 'fuel-station',
      name: 'Trạm Nhiên Liệu',
      type: 'FUEL_STATION',
      position: { x: 1650, y: 250 },
      dimensions: { width: 60, height: 50 },
    },
  ],
};

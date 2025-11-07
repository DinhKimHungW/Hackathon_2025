/**
 * Simulation Types & DTOs
 * Matches backend contract from simulation.service.ts
 */

// ==================== ENUMS ====================

export enum ScenarioType {
  SHIP_DELAY = 'SHIP_DELAY',
  ASSET_MAINTENANCE = 'ASSET_MAINTENANCE',
  CUSTOM = 'CUSTOM',
}

export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ConflictType {
  RESOURCE_DOUBLE_BOOKING = 'RESOURCE_DOUBLE_BOOKING',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  TIME_CONSTRAINT_VIOLATION = 'TIME_CONSTRAINT_VIOLATION',
  DEPENDENCY_VIOLATION = 'DEPENDENCY_VIOLATION',
}

export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RecommendationType {
  RESCHEDULE_TASK = 'RESCHEDULE_TASK',
  REASSIGN_ASSET = 'REASSIGN_ASSET',
  SPLIT_TASK = 'SPLIT_TASK',
  ADJUST_PRIORITY = 'ADJUST_PRIORITY',
}

// ==================== SCENARIO CHANGES ====================

export interface ScenarioChange {
  entityType: 'ship_visit' | 'asset' | 'task';
  entityId?: string;
  field: string;
  oldValue: any;
  newValue: any;
}

// Ship Delay specific config
export interface ShipDelayConfig {
  shipVisitId: string;
  delayHours: number;
  reason?: string;
}

// Asset Maintenance specific config
export interface AssetMaintenanceConfig {
  assetId: string;
  maintenanceStart: string; // ISO date string
  maintenanceDuration: number; // hours
  notes?: string;
}

// ==================== INPUT DTOs ====================

export interface CreateSimulationDto {
  name: string;
  baseScheduleId: string;
  scenarioType: ScenarioType;
  changes: ScenarioChange[];
}

// ==================== OUTPUT DTOs ====================

export interface ConflictDetailDto {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedTasks: string[]; // Task IDs or names
  recommendations?: string[];
  detectedAt?: Date;
}

export interface RecommendationDto {
  id: string;
  type: RecommendationType;
  description: string;
  estimatedImpact: string;
  targetTaskId?: string;
  targetAssetId?: string;
  suggestedTime?: string;
  confidence?: number; // 0-100
}

export interface SimulationMetrics {
  totalTasks: number;
  affectedTasks: number;
  totalDelayHours: number;
  resourceUtilizationBefore: number; // percentage
  resourceUtilizationAfter: number; // percentage
}

export interface SimulationResultDto {
  id: string;
  name: string;
  status: SimulationStatus;
  baseScheduleId: string;
  resultScheduleId: string;
  scenarioType: ScenarioType;
  executionTimeMs: number;
  conflictsDetected: number;
  conflicts: ConflictDetailDto[];
  recommendations: RecommendationDto[];
  metrics: SimulationMetrics;
  startedAt: string | Date;
  completedAt: string | Date;
  createdAt?: string | Date;
}

// ==================== UI HELPERS ====================

export interface SimulationFormData {
  name: string;
  scenarioType: ScenarioType;
  // Ship Delay fields
  shipDelayConfig?: ShipDelayConfig;
  // Asset Maintenance fields
  assetMaintenanceConfig?: AssetMaintenanceConfig;
  // Custom fields
  customChanges?: ScenarioChange[];
}

export const SCENARIO_TYPE_LABELS: Record<ScenarioType, string> = {
  [ScenarioType.SHIP_DELAY]: 'Ship Delay',
  [ScenarioType.ASSET_MAINTENANCE]: 'Asset Maintenance',
  [ScenarioType.CUSTOM]: 'Custom Scenario',
};

export const CONFLICT_SEVERITY_COLORS: Record<ConflictSeverity, string> = {
  [ConflictSeverity.LOW]: '#4caf50', // green
  [ConflictSeverity.MEDIUM]: '#ff9800', // orange
  [ConflictSeverity.HIGH]: '#f44336', // red
  [ConflictSeverity.CRITICAL]: '#d32f2f', // dark red
};

export const SIMULATION_STATUS_COLORS: Record<SimulationStatus, string> = {
  [SimulationStatus.PENDING]: '#9e9e9e', // gray
  [SimulationStatus.RUNNING]: '#2196f3', // blue
  [SimulationStatus.COMPLETED]: '#4caf50', // green
  [SimulationStatus.FAILED]: '#f44336', // red
};

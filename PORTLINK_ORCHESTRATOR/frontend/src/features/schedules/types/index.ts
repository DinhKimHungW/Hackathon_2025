// View Types
export type ViewMode = 'day' | 'week' | 'month';
export type GroupBy = 'none' | 'resource' | 'type' | 'status';
export type DisplayMode = 'timeline' | 'schedule' | 'workload' | 'dependencies';
export type TimeDisplayMode = 'list' | 'timeline';
export type ListViewMode = 'list' | 'grid';

// Basic Types
export type ScheduleType = 'SHIP_ARRIVAL' | 'MAINTENANCE' | 'PORT_OPERATION';
export type ScheduleStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type CalendarView = 'week' | 'month' | 'day';

// Export role-based types
export * from './role-based';

// Schedule Interfaces
export interface Schedule {
  id: string;
  name: string;
  description: string | null;
  type: ScheduleType;
  status: ScheduleStatus;
  startTime: string; // ISO string
  endTime: string; // ISO string
  berthId: string | null;
  berthName?: string;
  shipVisitId: string | null;
  shipVisitName?: string;
  recurrence: RecurrenceType;
  notes: string | null;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  completionPercentage?: number;
  priority?: number;
  operation?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  resources?: {
    berthId?: string;
    berthName?: string;
    pilotRequired?: boolean;
    pilotName?: string;
    tugboatCount?: number;
    cranes?: Array<{
      id: string;
      name?: string;
      capacity?: string;
      status?: string;
    }>;
    personnel?: Array<{
      name: string;
      role: string;
    }>;
  };
  shipVisit?: {
    vesselName?: string;
    vesselIMO?: string;
    voyageNumber?: string;
    assignedBerth?: string;
  };
}

// Filter Types
export interface ScheduleFilters {
  search: string;
  type: ScheduleType | 'ALL';
  status: ScheduleStatus | 'ALL';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  berthId: string | null;
  searchTerm?: string;
}

export interface CreateScheduleDto {
  name: string;
  description?: string;
  type: ScheduleType;
  startTime: Date;
  endTime: Date;
  berthId?: string;
  shipVisitId?: string;
  recurrence?: RecurrenceType;
  notes?: string;
}

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> {
  status?: ScheduleStatus;
}

// Component Props
export interface ListToolbarProps {
  viewMode: ListViewMode;
  onViewModeChange: (mode: ListViewMode) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onExport: () => void;
  onFilterClick: () => void;
  onSearchChange: (search: string) => void;
  activeFilters: {
    status?: ScheduleStatus[];
    type?: string[];
    dateRange?: [Date | null, Date | null];
  };
  onClearFilter: (filterType: 'status' | 'type' | 'dateRange') => void;
}

export interface TimelineToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFilterClick: () => void;
  dateRange: [Date, Date];
}

export interface ScheduleViewProps {
  filters: ScheduleFilters;
  onFilterChange: (filters: Partial<ScheduleFilters>) => void;
  onFilterClear: () => void;
}

// Task Interface
export interface Task {
  id: string;
  taskName: string;
  status: ScheduleStatus;
  startTime: string;
  endTime: string;
  assetId?: string;
  asset?: {
    id: string;
    name: string;
  };
  dependencies?: string[];
}

// Chart Props
export interface GanttChartProps {
  schedules: Schedule[];
  onScheduleClick: (schedule: Schedule) => void;
  config: {
    startDate: Date;
    endDate: Date;
    viewMode: ViewMode;
    grouping: GroupBy;
    zoomLevel: number;
  };
}

export interface ScheduleWorkloadChartProps {
  schedules: Schedule[];
  period: {
    start: Date;
    end: Date;
    type: ViewMode;
  };
}

export interface ScheduleDependencyGraphProps {
  schedules: Schedule[];
  onClick: (schedule: Schedule) => void;
}
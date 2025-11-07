/**
 * Role-based Schedule Types
 * Định nghĩa các types cho schedule theo từng role
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATIONS' | 'DRIVER';

// Thông tin lịch trình cho tàu (MANAGER/OPERATIONS role)
export interface ShipScheduleDetails {
  vesselName: string;
  vesselIMO: string;
  voyageNumber: string;
  // Thông tin cập bến
  berthingInfo: {
    berthLocation: string;
    arrivalTime: string;
    departureTime: string;
    estimatedStayDuration: number; // minutes
  };
  // Các hoạt động cảng
  cargoOperations: Array<{
    id: string;
    type: 'LOADING' | 'UNLOADING' | 'TRANSHIPMENT';
    containerCount: number;
    cargoType: string;
    startTime: string;
    endTime: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }>;
  // Dịch vụ cảng
  portServices: {
    pilotRequired: boolean;
    pilotName?: string;
    tugboatCount: number;
    mooringServices: boolean;
  };
  // Yêu cầu đặc biệt
  specialRequirements?: string[];
}

// Thông tin lịch trình cho tài xế (DRIVER role)
export interface DriverScheduleDetails {
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleNumber: string;
  // Thông tin công việc
  workDetails: {
    gateNumber: string; // Số cổng/công
    operationType: 'PICKUP' | 'DELIVERY' | 'TRANSFER';
    loadingZone: string;
    unloadingZone?: string;
  };
  // Container details
  containers: Array<{
    id: string;
    containerNumber: string;
    size: '20FT' | '40FT' | '45FT';
    type: 'DRY' | 'REEFER' | 'OPEN_TOP' | 'FLAT_RACK';
    weight: number;
    isEmpty: boolean;
    pickupLocation: string;
    deliveryLocation: string;
  }>;
  // Route information
  route: {
    origin: string;
    destination: string;
    waypoints?: Array<{
      location: string;
      arrivalTime: string;
      action: string;
    }>;
    estimatedDistance: number; // km
    estimatedDuration: number; // minutes
  };
  // Thời gian làm việc
  workShift: {
    startTime: string;
    endTime: string;
    breakTimes?: Array<{
      start: string;
      end: string;
    }>;
  };
}

// Thông tin lịch trình cho Admin (toàn bộ thông tin)
export interface AdminScheduleDetails {
  // Tổng quan
  overview: {
    totalSchedules: number;
    activeSchedules: number;
    completedSchedules: number;
    pendingSchedules: number;
  };
  // Phân bổ tài nguyên
  resourceAllocation: {
    berths: Array<{
      id: string;
      name: string;
      status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
      currentVessel?: string;
      utilization: number; // percentage
    }>;
    vehicles: Array<{
      id: string;
      number: string;
      driver: string;
      status: 'IDLE' | 'BUSY' | 'MAINTENANCE';
      currentTask?: string;
    }>;
    personnel: Array<{
      id: string;
      name: string;
      role: string;
      status: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY';
      currentAssignment?: string;
    }>;
  };
  // Hiệu suất
  performance: {
    onTimePercentage: number;
    averageDelay: number; // minutes
    resourceUtilization: number; // percentage
    completionRate: number; // percentage
  };
}

// Extended Schedule interface với role-specific data
export interface RoleBasedSchedule {
  // Common schedule data
  id: string;
  name: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  
  // Role-specific details
  shipDetails?: ShipScheduleDetails;
  driverDetails?: DriverScheduleDetails;
  adminDetails?: AdminScheduleDetails;
  
  // Metadata
  visibleToRoles: UserRole[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Schedule view configuration theo role
export interface RoleScheduleConfig {
  role: UserRole;
  viewPermissions: {
    canViewAll: boolean; // Admin có thể xem tất cả
    canViewOwn: boolean; // Driver/Ship chỉ xem của mình
    canFilter: boolean; // Có thể filter
    canExport: boolean; // Có thể export
    canEdit: boolean; // Có thể chỉnh sửa
    canDelete: boolean; // Có thể xóa
    canCreate: boolean; // Có thể tạo mới
  };
  defaultView: {
    mode: 'list' | 'timeline'; // Chế độ xem mặc định
    timelineMode?: 'day' | 'week' | 'month'; // Chế độ timeline
    groupBy?: 'none' | 'resource' | 'type' | 'status'; // Nhóm theo
    displayMode?: 'timeline' | 'schedule' | 'workload' | 'dependencies';
  };
  availableFilters: {
    byStatus: boolean;
    byType: boolean;
    byDate: boolean;
    byResource: boolean;
    byLocation: boolean;
  };
  visibleFields: string[]; // Các field hiển thị
  customActions: string[]; // Các action đặc biệt
}

// Filter configuration for role-based views
export interface RoleBasedFilters {
  role: UserRole;
  userId?: string; // For filtering personal schedules
  entityType?: 'SHIP' | 'DRIVER' | 'BERTH' | 'ALL';
  entityId?: string; // Specific ship/driver/berth ID
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm?: string;
}

// Display components mapping
export interface RoleViewComponents {
  role: UserRole;
  listComponent: string;
  timelineComponent: string;
  detailComponent: string;
  toolbarComponent: string;
  filterComponent: string;
}

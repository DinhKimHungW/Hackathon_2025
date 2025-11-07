/**
 * Schedule Configuration Hook
 * Hook để config schedules view theo role của user
 */

import { useMemo } from 'react';
import type { UserRole, RoleScheduleConfig } from '../types/role-based';

// Configuration cho mỗi role
const ROLE_CONFIGS: Record<UserRole, RoleScheduleConfig> = {
  ADMIN: {
    role: 'ADMIN',
    viewPermissions: {
      canViewAll: true,
      canViewOwn: true,
      canFilter: true,
      canExport: true,
      canEdit: true,
      canDelete: true,
      canCreate: true,
    },
    defaultView: {
      mode: 'timeline',
      timelineMode: 'week',
      groupBy: 'resource',
      displayMode: 'timeline',
    },
    availableFilters: {
      byStatus: true,
      byType: true,
      byDate: true,
      byResource: true,
      byLocation: true,
    },
    visibleFields: [
      'name',
      'type',
      'status',
      'startTime',
      'endTime',
      'resources',
      'assignedTo',
      'progress',
      'priority',
      'location',
      'notes',
    ],
    customActions: ['export', 'bulkEdit', 'analytics', 'optimize'],
  },
  
  MANAGER: {
    role: 'MANAGER',
    viewPermissions: {
      canViewAll: true,
      canViewOwn: true,
      canFilter: true,
      canExport: true,
      canEdit: true,
      canDelete: false,
      canCreate: true,
    },
    defaultView: {
      mode: 'timeline',
      timelineMode: 'week',
      groupBy: 'type',
      displayMode: 'workload',
    },
    availableFilters: {
      byStatus: true,
      byType: true,
      byDate: true,
      byResource: true,
      byLocation: true,
    },
    visibleFields: [
      'name',
      'type',
      'status',
      'startTime',
      'endTime',
      'resources',
      'progress',
      'vesselInfo',
      'cargoOperations',
    ],
    customActions: ['export', 'assignResources', 'viewAnalytics'],
  },
  
  OPERATIONS: {
    role: 'OPERATIONS',
    viewPermissions: {
      canViewAll: false,
      canViewOwn: true,
      canFilter: true,
      canExport: false,
      canEdit: false,
      canDelete: false,
      canCreate: false,
    },
    defaultView: {
      mode: 'list',
      timelineMode: 'day',
      groupBy: 'none',
      displayMode: 'schedule',
    },
    availableFilters: {
      byStatus: true,
      byType: false,
      byDate: true,
      byResource: false,
      byLocation: true,
    },
    visibleFields: [
      'name',
      'status',
      'startTime',
      'endTime',
      'berthLocation',
      'vesselName',
      'cargoType',
      'instructions',
    ],
    customActions: ['viewDetails', 'checkIn', 'updateStatus'],
  },
  
  DRIVER: {
    role: 'DRIVER',
    viewPermissions: {
      canViewAll: false,
      canViewOwn: true,
      canFilter: false,
      canExport: false,
      canEdit: false,
      canDelete: false,
      canCreate: false,
    },
    defaultView: {
      mode: 'list',
      timelineMode: 'day',
      groupBy: 'none',
      displayMode: 'schedule',
    },
    availableFilters: {
      byStatus: true,
      byType: false,
      byDate: true,
      byResource: false,
      byLocation: false,
    },
    visibleFields: [
      'startTime',
      'endTime',
      'gateNumber',
      'operationType',
      'containerNumber',
      'pickupLocation',
      'deliveryLocation',
      'route',
      'status',
    ],
    customActions: ['viewRoute', 'startTask', 'completeTask', 'reportIssue'],
  },
};

export function useScheduleConfig(role: UserRole): RoleScheduleConfig {
  return useMemo(() => {
    return ROLE_CONFIGS[role] || ROLE_CONFIGS.OPERATIONS;
  }, [role]);
}

// Helper để check permissions
export function useSchedulePermissions(role: UserRole) {
  const config = useScheduleConfig(role);
  
  return useMemo(() => ({
    canViewAll: config.viewPermissions.canViewAll,
    canViewOwn: config.viewPermissions.canViewOwn,
    canFilter: config.viewPermissions.canFilter,
    canExport: config.viewPermissions.canExport,
    canEdit: config.viewPermissions.canEdit,
    canDelete: config.viewPermissions.canDelete,
    canCreate: config.viewPermissions.canCreate,
  }), [config]);
}

// Helper để get visible fields
export function useVisibleFields(role: UserRole): string[] {
  const config = useScheduleConfig(role);
  return useMemo(() => config.visibleFields, [config]);
}

// Helper để get custom actions
export function useCustomActions(role: UserRole): string[] {
  const config = useScheduleConfig(role);
  return useMemo(() => config.customActions, [config]);
}

// Helper để check nếu filter có available
export function useAvailableFilters(role: UserRole) {
  const config = useScheduleConfig(role);
  return useMemo(() => config.availableFilters, [config]);
}

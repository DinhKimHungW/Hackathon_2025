# PortLink Orchestrator - API Integration Guide

**Complete guide to backend API integration and WebSocket real-time communication**

---

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket Events](#websocket-events)
- [Redux Integration](#redux-integration)
- [Error Handling](#error-handling)
- [Request/Response Examples](#requestresponse-examples)

---

## 🌐 API Overview

### Base Configuration

**Environment Variables:**
```bash
VITE_API_URL=http://localhost:3000/api    # REST API
VITE_WS_URL=http://localhost:3000         # WebSocket
```

**Axios Instance** (`api/axios.config.ts`):
```typescript
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-attach JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/auth/refresh', { refreshToken });
      localStorage.setItem('access_token', response.data.accessToken);
      // Retry original request
      error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 🔐 Authentication

### POST /auth/login

**Request:**
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-123",
    "username": "admin",
    "email": "admin@portlink.com",
    "role": "ADMIN"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Frontend Implementation** (`api/auth.api.ts`):
```typescript
import { axiosInstance } from './axios.config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  },
};
```

**Redux Thunk** (`features/auth/authSlice.ts`):
```typescript
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);
```

### POST /auth/refresh

**Request:**
```typescript
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout

**Request:**
```typescript
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 📡 REST API Endpoints

### Ship Visits

#### GET /ship-visits

**Query Parameters:**
- `status` (optional): SCHEDULED | ARRIVED | IN_PROGRESS | DEPARTED
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Request:**
```typescript
GET /api/ship-visits?status=ARRIVED&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "sv-123",
      "shipName": "MSC Oscar",
      "imoNumber": "9793320",
      "visitType": "CONTAINER",
      "expectedArrival": "2025-01-15T08:00:00Z",
      "expectedDeparture": "2025-01-15T18:00:00Z",
      "actualArrival": "2025-01-15T08:15:00Z",
      "actualDeparture": null,
      "status": "ARRIVED",
      "berthId": "berth-a1",
      "priority": "HIGH",
      "cargoDetails": "Container unloading",
      "notes": "Priority vessel",
      "createdAt": "2025-01-10T12:00:00Z",
      "updatedAt": "2025-01-15T08:15:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /ship-visits

**Request:**
```typescript
POST /api/ship-visits
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipName": "Ever Given",
  "imoNumber": "9811000",
  "visitType": "CONTAINER",
  "expectedArrival": "2025-01-20T10:00:00Z",
  "expectedDeparture": "2025-01-20T20:00:00Z",
  "berthId": "berth-b2",
  "priority": "MEDIUM",
  "cargoDetails": "Container loading/unloading",
  "notes": "Regular scheduled visit"
}
```

**Response (201):**
```json
{
  "id": "sv-124",
  "shipName": "Ever Given",
  "imoNumber": "9811000",
  "status": "SCHEDULED",
  ...
}
```

#### GET /ship-visits/:id

**Request:**
```typescript
GET /api/ship-visits/sv-123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "sv-123",
  "shipName": "MSC Oscar",
  ...
}
```

#### PUT /ship-visits/:id

**Request:**
```typescript
PUT /api/ship-visits/sv-123
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "actualArrival": "2025-01-15T08:15:00Z"
}
```

**Response (200):**
```json
{
  "id": "sv-123",
  "status": "IN_PROGRESS",
  "actualArrival": "2025-01-15T08:15:00Z",
  ...
}
```

#### DELETE /ship-visits/:id

**Request:**
```typescript
DELETE /api/ship-visits/sv-123
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Ship visit deleted successfully"
}
```

---

### Tasks

#### GET /tasks

**Query Parameters:**
- `shipVisitId` (optional): Filter by ship visit
- `status` (optional): PENDING | IN_PROGRESS | COMPLETED | CANCELLED
- `page`, `limit`

**Request:**
```typescript
GET /api/tasks?shipVisitId=sv-123&status=PENDING
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "task-456",
      "taskName": "Container Unloading",
      "taskType": "UNLOADING",
      "shipVisitId": "sv-123",
      "startTime": "2025-01-15T09:00:00Z",
      "endTime": "2025-01-15T12:00:00Z",
      "assignedCraneId": "crane-01",
      "status": "PENDING",
      "priority": "HIGH",
      "dependencies": [],
      "createdAt": "2025-01-10T12:00:00Z",
      "updatedAt": "2025-01-10T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

#### POST /tasks

**Request:**
```typescript
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskName": "Container Loading",
  "taskType": "LOADING",
  "shipVisitId": "sv-123",
  "startTime": "2025-01-15T13:00:00Z",
  "endTime": "2025-01-15T16:00:00Z",
  "assignedCraneId": "crane-02",
  "priority": "MEDIUM",
  "dependencies": ["task-456"]
}
```

**Response (201):**
```json
{
  "id": "task-457",
  "taskName": "Container Loading",
  "status": "PENDING",
  ...
}
```

#### PUT /tasks/:id

**Request:**
```typescript
PUT /api/tasks/task-456
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Response (200):**
```json
{
  "id": "task-456",
  "status": "IN_PROGRESS",
  ...
}
```

---

### Assets

#### GET /assets/:assetType

**Asset Types:** `berths` | `cranes` | `trucks` | `warehouses`

**Request:**
```typescript
GET /api/assets/cranes
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "crane-01",
      "name": "Crane A1",
      "assetType": "CRANE",
      "status": "AVAILABLE",
      "capacity": 50.0,
      "specifications": {
        "maxLoad": "50 tons",
        "reach": "40 meters"
      },
      "lastMaintenanceDate": "2025-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

#### POST /assets

**Request:**
```typescript
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Crane B3",
  "assetType": "CRANE",
  "capacity": 60.0,
  "specifications": {
    "maxLoad": "60 tons",
    "reach": "45 meters"
  }
}
```

**Response (201):**
```json
{
  "id": "crane-03",
  "name": "Crane B3",
  "status": "AVAILABLE",
  ...
}
```

#### PUT /assets/:id/status

**Request:**
```typescript
PUT /api/assets/crane-01/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "MAINTENANCE",
  "reason": "Routine inspection"
}
```

**Response (200):**
```json
{
  "id": "crane-01",
  "status": "MAINTENANCE",
  ...
}
```

---

### Conflicts

#### GET /conflicts

**Query Parameters:**
- `status`: ACTIVE | RESOLVED
- `severity`: LOW | MEDIUM | HIGH | CRITICAL
- `type`: RESOURCE_CONFLICT | BERTH_CONFLICT | CRANE_CONFLICT | TIME_CONFLICT

**Request:**
```typescript
GET /api/conflicts?status=ACTIVE&severity=HIGH
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "conflict-789",
      "conflictType": "CRANE_CONFLICT",
      "severity": "HIGH",
      "description": "Crane crane-01 assigned to multiple tasks",
      "affectedEntities": {
        "tasks": ["task-456", "task-457"],
        "cranes": ["crane-01"]
      },
      "suggestions": [
        {
          "action": "REASSIGN_CRANE",
          "details": "Reassign task-457 to crane-02"
        }
      ],
      "status": "ACTIVE",
      "detectedAt": "2025-01-15T09:00:00Z",
      "resolvedAt": null
    }
  ],
  "meta": { ... }
}
```

#### POST /conflicts/:id/resolve

**Request:**
```typescript
POST /api/conflicts/conflict-789/resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution": "Reassigned task-457 to crane-02",
  "action": "REASSIGN_CRANE"
}
```

**Response (200):**
```json
{
  "id": "conflict-789",
  "status": "RESOLVED",
  "resolvedAt": "2025-01-15T09:15:00Z",
  ...
}
```

---

### Event Logs

#### GET /event-logs

**Query Parameters:**
- `eventType`: SHIP_VISIT_CREATED | TASK_COMPLETED | CONFLICT_DETECTED | etc.
- `severity`: INFO | WARNING | ERROR | CRITICAL
- `startDate`, `endDate`
- `userId`
- `page`, `limit`

**Request:**
```typescript
GET /api/event-logs?eventType=TASK_COMPLETED&severity=INFO&page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "log-001",
      "eventType": "TASK_COMPLETED",
      "severity": "INFO",
      "description": "Task 'Container Unloading' completed",
      "userId": "user-123",
      "ipAddress": "192.168.1.100",
      "metadata": {
        "taskId": "task-456",
        "taskName": "Container Unloading"
      },
      "timestamp": "2025-01-15T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### KPIs (Dashboard)

#### GET /kpis

**Request:**
```typescript
GET /api/kpis
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "totalShipVisits": 125,
  "activeShipVisits": 8,
  "totalTasks": 450,
  "pendingTasks": 32,
  "inProgressTasks": 15,
  "completedTasks": 403,
  "activeConflicts": 3,
  "assetsStatus": {
    "available": 45,
    "inUse": 12,
    "maintenance": 3,
    "outOfService": 2
  }
}
```

---

## 🔌 WebSocket Events

### Connection Setup

**Frontend** (`api/websocket.ts`):
```typescript
import io from 'socket.io-client';

let socket: any = null;

export const connectWebSocket = (accessToken: string) => {
  socket = io(import.meta.env.VITE_WS_URL, {
    auth: { token: accessToken },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### Events: Ship Visits

**Join Room:**
```typescript
socket.emit('join:ship-visits');
```

**Listen for Updates:**
```typescript
socket.on('ship-visit:created', (shipVisit) => {
  dispatch(addShipVisitRealtime(shipVisit));
});

socket.on('ship-visit:updated', (shipVisit) => {
  dispatch(updateShipVisitRealtime(shipVisit));
});

socket.on('ship-visit:deleted', (shipVisitId) => {
  dispatch(removeShipVisitRealtime(shipVisitId));
});
```

**Leave Room:**
```typescript
socket.emit('leave:ship-visits');
```

### Events: Tasks

**Join Room:**
```typescript
socket.emit('join:tasks');
```

**Listen for Updates:**
```typescript
socket.on('task:created', (task) => {
  dispatch(addTaskRealtime(task));
});

socket.on('task:updated', (task) => {
  dispatch(updateTaskRealtime(task));
});

socket.on('task:deleted', (taskId) => {
  dispatch(removeTaskRealtime(taskId));
});

socket.on('task:status-changed', ({ taskId, status }) => {
  dispatch(updateTaskStatus({ taskId, status }));
});
```

### Events: Conflicts

**Join Room:**
```typescript
socket.emit('join:conflicts');
```

**Listen for Updates:**
```typescript
socket.on('conflict:detected', (conflict) => {
  dispatch(addConflictRealtime(conflict));
  // Show browser notification
  if (conflict.severity === 'CRITICAL' && Notification.permission === 'granted') {
    new Notification('Critical Conflict Detected', {
      body: conflict.description,
      icon: '/logo.png',
    });
  }
});

socket.on('conflict:resolved', (conflictId) => {
  dispatch(removeConflictRealtime(conflictId));
});
```

### Events: KPIs

**Join Room:**
```typescript
socket.emit('join:kpis');
```

**Listen for Updates:**
```typescript
socket.on('kpis:updated', (kpis) => {
  dispatch(updateKPIsRealtime(kpis));
});
```

---

## 🔄 Redux Integration

### Example: Ship Visits Slice

**Redux Thunks** (`features/shipVisits/shipVisitsSlice.ts`):
```typescript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '@/api/axios.config';

// Fetch ship visits
export const fetchShipVisits = createAsyncThunk(
  'shipVisits/fetchShipVisits',
  async () => {
    const response = await axiosInstance.get('/ship-visits');
    return response.data.data;
  }
);

// Create ship visit
export const createShipVisit = createAsyncThunk(
  'shipVisits/createShipVisit',
  async (shipVisit: CreateShipVisitDto) => {
    const response = await axiosInstance.post('/ship-visits', shipVisit);
    return response.data;
  }
);

// Update ship visit
export const updateShipVisit = createAsyncThunk(
  'shipVisits/updateShipVisit',
  async ({ id, updates }: { id: string; updates: Partial<ShipVisit> }) => {
    const response = await axiosInstance.put(`/ship-visits/${id}`, updates);
    return response.data;
  }
);

// Delete ship visit
export const deleteShipVisit = createAsyncThunk(
  'shipVisits/deleteShipVisit',
  async (id: string) => {
    await axiosInstance.delete(`/ship-visits/${id}`);
    return id;
  }
);

// Slice
const shipVisitsSlice = createSlice({
  name: 'shipVisits',
  initialState: { ... },
  reducers: {
    // Real-time updates
    addShipVisitRealtime(state, action) {
      state.shipVisits.push(action.payload);
    },
    updateShipVisitRealtime(state, action) {
      const index = state.shipVisits.findIndex(sv => sv.id === action.payload.id);
      if (index !== -1) {
        state.shipVisits[index] = action.payload;
      }
    },
    removeShipVisitRealtime(state, action) {
      state.shipVisits = state.shipVisits.filter(sv => sv.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Handle async thunks...
  },
});
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "imoNumber",
      "message": "IMO number must be 7 digits"
    }
  ]
}
```

### Common Status Codes

| Code | Meaning | Handling |
|------|---------|----------|
| 200 | Success | Process data |
| 201 | Created | Show success message |
| 400 | Bad Request | Display validation errors |
| 401 | Unauthorized | Refresh token or logout |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show "not found" message |
| 500 | Server Error | Show generic error message |

### Frontend Error Handling

```typescript
try {
  await dispatch(createShipVisit(formData)).unwrap();
  toast.success('Ship visit created successfully');
} catch (error: any) {
  if (error.statusCode === 400) {
    // Validation errors
    toast.error(error.message);
  } else if (error.statusCode === 401) {
    // Unauthorized
    dispatch(logout());
  } else {
    // Generic error
    toast.error('An error occurred. Please try again.');
  }
}
```

---

**API Integration Guide - Version 1.0**

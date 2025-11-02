# API SPECIFICATION DOCUMENT

**Project:** PortLink Orchestrator - Digital Twin Platform  
**Version:** 1.0 - Part 1/3  
**Last Updated:** 02/11/2025  
**Document Status:** In Progress

---

## Table of Contents - Part 1

1. [Introduction](#1-introduction)
2. [API Overview](#2-api-overview)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Common Patterns](#4-common-patterns)
5. [Authentication Module APIs](#5-authentication-module-apis)
6. [User Management APIs](#6-user-management-apis)

---

## 1. Introduction

### 1.1. Document Purpose

Tài liệu này định nghĩa chi tiết toàn bộ REST APIs và WebSocket events của PortLink Orchestrator, bao gồm:
- REST API endpoints với request/response schemas
- WebSocket events và message formats
- Authentication và authorization requirements
- Error handling và status codes
- Rate limiting và pagination
- Validation rules và constraints

### 1.2. API Versioning

```
Base URL: https://api.portlink.example.com
Version: v1
Format: /api/v1/{resource}
```

**Version Strategy:**
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Backward compatibility maintained for 12 months
- Deprecation warnings in response headers

### 1.3. Supported Formats

- **Request:** JSON (application/json)
- **Response:** JSON (application/json)
- **WebSocket:** JSON messages
- **Character Encoding:** UTF-8

### 1.4. API Environments

| Environment | Base URL | Purpose |
|------------|----------|---------|
| Development | `http://localhost:4000/api/v1` | Local development |
| Staging | `https://staging-api.portlink.com/api/v1` | Testing |
| Production | `https://api.portlink.com/api/v1` | Live system |

---

## 2. API Overview

### 2.1. API Categories

```
PortLink Orchestrator APIs
│
├── Authentication & Users (Part 1)
│   ├── POST   /api/v1/auth/login
│   ├── POST   /api/v1/auth/refresh
│   ├── POST   /api/v1/auth/logout
│   ├── GET    /api/v1/users
│   └── PATCH  /api/v1/users/:id
│
├── Operations & Scheduling (Part 2)
│   ├── GET    /api/v1/vessels
│   ├── GET    /api/v1/berths
│   ├── GET    /api/v1/schedules
│   ├── POST   /api/v1/schedules
│   ├── GET    /api/v1/tasks
│   └── PATCH  /api/v1/tasks/:id/status
│
├── Simulation & Analytics (Part 2)
│   ├── POST   /api/v1/simulations
│   ├── GET    /api/v1/simulations/:id
│   ├── GET    /api/v1/analytics/kpis
│   └── GET    /api/v1/analytics/reports
│
└── WebSocket Events (Part 3)
    ├── schedule.updated
    ├── task.status.changed
    ├── simulation.completed
    └── kpi.updated
```

### 2.2. HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resources | ✅ Yes |
| POST | Create new resources | ❌ No |
| PUT | Full update (replace) | ✅ Yes |
| PATCH | Partial update | ✅ Yes |
| DELETE | Remove resources | ✅ Yes |

### 2.3. Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2025-11-02T10:30:00Z",
    "requestId": "req_abc123xyz"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-02T10:30:00Z",
    "requestId": "req_abc123xyz"
  }
}
```

### 2.4. HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

---

## 3. Authentication & Authorization

### 3.1. Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└─────┬────┘                                    └────┬─────┘
      │                                              │
      │  1. POST /auth/login                         │
      │  { username, password }                      │
      ├─────────────────────────────────────────────>│
      │                                              │
      │  2. Validate credentials                     │
      │                                              │
      │  3. Generate tokens                          │
      │                                              │
      │  4. Return tokens                            │
      │  { accessToken, refreshToken }               │
      │<─────────────────────────────────────────────┤
      │                                              │
      │  5. Store tokens                             │
      │                                              │
      │  6. API Request                              │
      │  Authorization: Bearer {accessToken}         │
      ├─────────────────────────────────────────────>│
      │                                              │
      │  7. Validate token & permissions             │
      │                                              │
      │  8. Return data                              │
      │<─────────────────────────────────────────────┤
      │                                              │
      │  9. Token expired (401)                      │
      │<─────────────────────────────────────────────┤
      │                                              │
      │  10. POST /auth/refresh                      │
      │  { refreshToken }                            │
      ├─────────────────────────────────────────────>│
      │                                              │
      │  11. New tokens                              │
      │<─────────────────────────────────────────────┤
      │                                              │
```

### 3.2. JWT Token Structure

**Access Token (1 hour expiry):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "username": "john.ops",
    "role": "OPERATIONS",
    "permissions": ["view_schedule", "update_tasks"],
    "iat": 1698926400,
    "exp": 1698930000
  }
}
```

**Refresh Token (7 days expiry):**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "type": "refresh",
    "iat": 1698926400,
    "exp": 1699531200
  }
}
```

### 3.3. Authorization Header

```http
GET /api/v1/schedules HTTP/1.1
Host: api.portlink.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### 3.4. Role-Based Access Control (RBAC)

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **ADMIN** | Full system access | Create, Read, Update, Delete all resources |
| **MANAGER** | Analytics, reporting, approval | Read all, Update schedules, Approve simulations |
| **OPERATIONS** | Schedule management | Read/Update schedules, tasks, vessels |
| **DRIVER** | Task execution | Read assigned tasks, Update task status |

**Permission Matrix:**

```typescript
enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  
  // Schedule management
  VIEW_SCHEDULE = 'view_schedule',
  CREATE_SCHEDULE = 'create_schedule',
  UPDATE_SCHEDULE = 'update_schedule',
  DELETE_SCHEDULE = 'delete_schedule',
  
  // Task management
  VIEW_TASKS = 'view_tasks',
  UPDATE_TASK_STATUS = 'update_task_status',
  ASSIGN_TASKS = 'assign_tasks',
  
  // Simulation
  VIEW_SIMULATIONS = 'view_simulations',
  RUN_SIMULATION = 'run_simulation',
  APPROVE_SIMULATION = 'approve_simulation',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_REPORTS = 'export_reports',
}

const ROLE_PERMISSIONS = {
  ADMIN: Object.values(Permission),
  MANAGER: [
    Permission.VIEW_USERS,
    Permission.VIEW_SCHEDULE,
    Permission.UPDATE_SCHEDULE,
    Permission.VIEW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_SIMULATIONS,
    Permission.RUN_SIMULATION,
    Permission.APPROVE_SIMULATION,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
  ],
  OPERATIONS: [
    Permission.VIEW_SCHEDULE,
    Permission.CREATE_SCHEDULE,
    Permission.UPDATE_SCHEDULE,
    Permission.VIEW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.RUN_SIMULATION,
    Permission.VIEW_ANALYTICS,
  ],
  DRIVER: [
    Permission.VIEW_TASKS,
    Permission.UPDATE_TASK_STATUS,
  ],
};
```

---

## 4. Common Patterns

### 4.1. Pagination

**Request:**
```http
GET /api/v1/vessels?page=1&limit=20&sort=name&order=asc
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `sort` (string, optional) - Sort field
- `order` (string, optional) - Sort order: 'asc' | 'desc'

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "name": "Vessel A" },
      { "id": 2, "name": "Vessel B" }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 4.2. Filtering

**Request:**
```http
GET /api/v1/tasks?status=IN_PROGRESS&assignedTo=user_123&startDate=2025-11-01
```

**Common Filters:**
- Exact match: `?status=COMPLETED`
- Multiple values: `?status=IN_PROGRESS,COMPLETED`
- Date range: `?startDate=2025-11-01&endDate=2025-11-30`
- Search: `?search=vessel%20name`
- Boolean: `?isActive=true`

### 4.3. Field Selection

**Request:**
```http
GET /api/v1/vessels?fields=id,name,status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "name": "Vessel A", "status": "BERTHED" }
    ]
  }
}
```

### 4.4. Error Handling

**Validation Error (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "constraint": "isEmail"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "constraint": "minLength"
      }
    ]
  }
}
```

**Business Logic Error (409):**
```json
{
  "success": false,
  "error": {
    "code": "BERTH_OCCUPIED",
    "message": "Berth B-101 is already occupied during the requested time slot",
    "details": {
      "berthId": "berth_101",
      "conflictingSchedule": "schedule_456",
      "timeSlot": {
        "start": "2025-11-02T08:00:00Z",
        "end": "2025-11-02T12:00:00Z"
      }
    }
  }
}
```

### 4.5. Rate Limiting

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698930000
```

**Rate Limits:**
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Admin: 1000 requests/minute

**429 Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 5. Authentication Module APIs

### 5.1. Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive access/refresh tokens

**Request:**
```json
{
  "username": "john.ops",
  "password": "SecurePassword123!"
}
```

**Request Schema:**
```typescript
interface LoginRequest {
  username: string;     // Required, 3-50 chars
  password: string;     // Required, min 8 chars
}
```

**Validation Rules:**
- `username`: Required, alphanumeric + underscore/dot, 3-50 characters
- `password`: Required, minimum 8 characters

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "john.ops",
      "email": "john@portlink.com",
      "fullName": "John Operations",
      "role": "OPERATIONS",
      "permissions": [
        "view_schedule",
        "create_schedule",
        "update_schedule",
        "view_tasks",
        "assign_tasks"
      ],
      "language": "vi",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastLoginAt": "2025-11-02T08:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  },
  "meta": {
    "timestamp": "2025-11-02T08:30:00Z",
    "requestId": "req_login_abc123"
  }
}
```

**Error Responses:**

```json
// 401 - Invalid credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}

// 403 - Account locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account has been locked due to multiple failed login attempts",
    "details": {
      "lockedUntil": "2025-11-02T09:30:00Z",
      "remainingTime": 3600
    }
  }
}

// 422 - Validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "password",
        "message": "Password is required"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X POST https://api.portlink.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.ops",
    "password": "SecurePassword123!"
  }'
```

---

### 5.2. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Obtain new access token using refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Schema:**
```typescript
interface RefreshTokenRequest {
  refreshToken: string;  // Required, valid JWT refresh token
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

**Error Responses:**
```json
// 401 - Invalid or expired token
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired"
  }
}
```

---

### 5.3. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Invalidate current tokens and logout user

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Example:**
```bash
curl -X POST https://api.portlink.com/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

---

### 5.4. Get Current User Profile

**Endpoint:** `GET /api/v1/auth/profile`

**Description:** Get authenticated user's profile information

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "john.ops",
    "email": "john@portlink.com",
    "fullName": "John Operations",
    "phoneNumber": "+84901234567",
    "role": "OPERATIONS",
    "permissions": [
      "view_schedule",
      "create_schedule",
      "update_schedule"
    ],
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "avatar": "https://cdn.portlink.com/avatars/user_123.jpg",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "lastLoginAt": "2025-11-02T08:30:00Z"
  }
}
```

---

### 5.5. Update Profile

**Endpoint:** `PATCH /api/v1/auth/profile`

**Description:** Update current user's profile

**Authentication:** Required

**Request:**
```json
{
  "fullName": "John Updated",
  "phoneNumber": "+84901234567",
  "language": "en",
  "timezone": "Asia/Singapore"
}
```

**Request Schema:**
```typescript
interface UpdateProfileRequest {
  fullName?: string;      // Optional, 2-100 chars
  phoneNumber?: string;   // Optional, valid phone format
  language?: 'vi' | 'en'; // Optional
  timezone?: string;      // Optional, valid timezone
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "fullName": "John Updated",
    "phoneNumber": "+84901234567",
    "language": "en",
    "timezone": "Asia/Singapore",
    "updatedAt": "2025-11-02T10:00:00Z"
  }
}
```

---

### 5.6. Change Password

**Endpoint:** `POST /api/v1/auth/change-password`

**Description:** Change current user's password

**Authentication:** Required

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```

**Request Schema:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;  // Required
  newPassword: string;      // Required, min 8 chars, must include uppercase, lowercase, number, special char
  confirmPassword: string;  // Required, must match newPassword
}
```

**Validation Rules:**
- Current password must be correct
- New password: min 8 characters, must contain uppercase, lowercase, number, special character
- New password must be different from current password
- Confirm password must match new password

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

**Error Responses:**
```json
// 401 - Incorrect current password
{
  "success": false,
  "error": {
    "code": "INCORRECT_PASSWORD",
    "message": "Current password is incorrect"
  }
}

// 422 - Weak password
{
  "success": false,
  "error": {
    "code": "WEAK_PASSWORD",
    "message": "Password does not meet security requirements",
    "details": {
      "requirements": [
        "At least 8 characters",
        "At least one uppercase letter",
        "At least one lowercase letter",
        "At least one number",
        "At least one special character"
      ]
    }
  }
}
```

---

## 6. User Management APIs

### 6.1. List Users

**Endpoint:** `GET /api/v1/users`

**Description:** Retrieve paginated list of users

**Authentication:** Required

**Permissions:** `view_users`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `role` (string, optional) - Filter by role: ADMIN, MANAGER, OPERATIONS, DRIVER
- `isActive` (boolean, optional) - Filter by active status
- `search` (string, optional) - Search in username, email, fullName
- `sort` (string, optional) - Sort field: username, email, createdAt
- `order` (string, optional) - Sort order: asc, desc

**Example Request:**
```http
GET /api/v1/users?page=1&limit=20&role=OPERATIONS&isActive=true&search=john
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user_123",
        "username": "john.ops",
        "email": "john@portlink.com",
        "fullName": "John Operations",
        "phoneNumber": "+84901234567",
        "role": "OPERATIONS",
        "isActive": true,
        "language": "vi",
        "createdAt": "2024-01-15T10:00:00Z",
        "lastLoginAt": "2025-11-02T08:30:00Z"
      },
      {
        "id": "user_124",
        "username": "jane.ops",
        "email": "jane@portlink.com",
        "fullName": "Jane Operations",
        "phoneNumber": "+84902345678",
        "role": "OPERATIONS",
        "isActive": true,
        "language": "en",
        "createdAt": "2024-02-20T10:00:00Z",
        "lastLoginAt": "2025-11-01T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 6.2. Get User by ID

**Endpoint:** `GET /api/v1/users/:id`

**Description:** Get detailed information of a specific user

**Authentication:** Required

**Permissions:** `view_users`

**Path Parameters:**
- `id` (string) - User ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "john.ops",
    "email": "john@portlink.com",
    "fullName": "John Operations",
    "phoneNumber": "+84901234567",
    "role": "OPERATIONS",
    "permissions": [
      "view_schedule",
      "create_schedule",
      "update_schedule",
      "view_tasks",
      "assign_tasks"
    ],
    "isActive": true,
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "avatar": "https://cdn.portlink.com/avatars/user_123.jpg",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2025-11-01T10:00:00Z",
    "lastLoginAt": "2025-11-02T08:30:00Z",
    "loginCount": 342
  }
}
```

**Error Responses:**
```json
// 404 - User not found
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 'user_999' not found"
  }
}
```

---

### 6.3. Create User

**Endpoint:** `POST /api/v1/users`

**Description:** Create a new user

**Authentication:** Required

**Permissions:** `manage_users`

**Request:**
```json
{
  "username": "new.driver",
  "email": "newdriver@portlink.com",
  "password": "SecurePassword123!",
  "fullName": "New Driver",
  "phoneNumber": "+84903456789",
  "role": "DRIVER",
  "language": "vi",
  "isActive": true
}
```

**Request Schema:**
```typescript
interface CreateUserRequest {
  username: string;           // Required, unique, 3-50 chars, alphanumeric + underscore/dot
  email: string;              // Required, unique, valid email
  password: string;           // Required, min 8 chars
  fullName: string;           // Required, 2-100 chars
  phoneNumber?: string;       // Optional, valid phone format
  role: UserRole;             // Required: ADMIN, MANAGER, OPERATIONS, DRIVER
  language?: 'vi' | 'en';     // Optional, default: 'vi'
  timezone?: string;          // Optional, default: 'Asia/Ho_Chi_Minh'
  isActive?: boolean;         // Optional, default: true
}
```

**Validation Rules:**
- `username`: Unique, 3-50 characters, alphanumeric + underscore/dot only
- `email`: Unique, valid email format
- `password`: Min 8 characters, must include uppercase, lowercase, number, special char
- `fullName`: 2-100 characters
- `phoneNumber`: Valid international phone format (if provided)
- `role`: One of ADMIN, MANAGER, OPERATIONS, DRIVER

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user_125",
    "username": "new.driver",
    "email": "newdriver@portlink.com",
    "fullName": "New Driver",
    "phoneNumber": "+84903456789",
    "role": "DRIVER",
    "permissions": [
      "view_tasks",
      "update_task_status"
    ],
    "isActive": true,
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh",
    "createdAt": "2025-11-02T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 409 - Username already exists
{
  "success": false,
  "error": {
    "code": "USERNAME_ALREADY_EXISTS",
    "message": "Username 'new.driver' is already taken"
  }
}

// 409 - Email already exists
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Email 'newdriver@portlink.com' is already registered"
  }
}
```

---

### 6.4. Update User

**Endpoint:** `PATCH /api/v1/users/:id`

**Description:** Update user information

**Authentication:** Required

**Permissions:** `manage_users`

**Path Parameters:**
- `id` (string) - User ID

**Request:**
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "+84904567890",
  "role": "OPERATIONS",
  "isActive": false
}
```

**Request Schema:**
```typescript
interface UpdateUserRequest {
  fullName?: string;         // Optional, 2-100 chars
  phoneNumber?: string;      // Optional, valid phone format
  role?: UserRole;           // Optional: ADMIN, MANAGER, OPERATIONS, DRIVER
  language?: 'vi' | 'en';    // Optional
  timezone?: string;         // Optional
  isActive?: boolean;        // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_125",
    "username": "new.driver",
    "email": "newdriver@portlink.com",
    "fullName": "Updated Name",
    "phoneNumber": "+84904567890",
    "role": "OPERATIONS",
    "permissions": [
      "view_schedule",
      "create_schedule",
      "update_schedule",
      "view_tasks",
      "assign_tasks"
    ],
    "isActive": false,
    "language": "vi",
    "updatedAt": "2025-11-02T11:00:00Z"
  }
}
```

---

### 6.5. Delete User

**Endpoint:** `DELETE /api/v1/users/:id`

**Description:** Soft delete a user (mark as inactive)

**Authentication:** Required

**Permissions:** `manage_users`

**Path Parameters:**
- `id` (string) - User ID

**Response (204 No Content):**
```
(Empty body)
```

**Error Responses:**
```json
// 403 - Cannot delete self
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SELF",
    "message": "You cannot delete your own account"
  }
}

// 404 - User not found
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 'user_999' not found"
  }
}
```

---

### 6.6. Reset User Password

**Endpoint:** `POST /api/v1/users/:id/reset-password`

**Description:** Admin reset user's password

**Authentication:** Required

**Permissions:** `manage_users`

**Path Parameters:**
- `id` (string) - User ID

**Request:**
```json
{
  "newPassword": "NewSecurePassword123!",
  "sendEmail": true
}
```

**Request Schema:**
```typescript
interface ResetPasswordRequest {
  newPassword: string;  // Required, min 8 chars
  sendEmail?: boolean;  // Optional, default: true - Send email notification to user
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully",
    "emailSent": true
  }
}
```

---

**KẾT THÚC PART 1**

---

## Tổng kết Part 1

### Nội dung đã hoàn thành:
✅ **1. Introduction** - Mục đích, versioning, formats, environments  
✅ **2. API Overview** - Categories, HTTP methods, response formats, status codes  
✅ **3. Authentication & Authorization** - Flow diagram, JWT structure, RBAC matrix  
✅ **4. Common Patterns** - Pagination, filtering, field selection, error handling, rate limiting  
✅ **5. Authentication Module APIs** - Login, refresh, logout, profile, change password (6 endpoints)  
✅ **6. User Management APIs** - List, get, create, update, delete, reset password (6 endpoints)  

### Sẵn sàng cho Part 2:
- Operations & Scheduling APIs (Vessels, Berths, Schedules, Tasks)
- Simulation APIs
- Analytics & KPI APIs

---

**Version:** 1.0 - Part 1/3  
**Status:** ✅ Completed  
**Last Updated:** 02/11/2025

---
---

# PART 2: OPERATIONS & ANALYTICS APIs

**Trạng thái:** Completed - Part 2/3  
**Last Updated:** 02/11/2025

---

## Table of Contents - Part 2

7. [Vessel Management APIs](#7-vessel-management-apis)
8. [Berth Management APIs](#8-berth-management-apis)
9. [Schedule Management APIs](#9-schedule-management-apis)
10. [Task Management APIs](#10-task-management-apis)
11. [Simulation APIs](#11-simulation-apis)
12. [Analytics & KPI APIs](#12-analytics--kpi-apis)

---

## 7. Vessel Management APIs

### 7.1. List Vessels

**Endpoint:** `GET /api/v1/vessels`

**Description:** Retrieve paginated list of vessels

**Authentication:** Required

**Permissions:** `view_schedule`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (string, optional) - Filter: EXPECTED, BERTHING, BERTHED, OPERATING, DEPARTED
- `search` (string, optional) - Search in name, imoNumber, callSign
- `sort` (string, optional) - Sort field: name, eta, status
- `order` (string, optional) - asc | desc

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "vessel_001",
        "name": "MSC MARINA",
        "imoNumber": "IMO9876543",
        "callSign": "ABCD",
        "flag": "Panama",
        "vesselType": "CONTAINER",
        "length": 366.0,
        "beam": 51.2,
        "draft": 14.5,
        "grossTonnage": 150000,
        "capacity": {
          "teu": 15000,
          "maxDraft": 16.0
        },
        "status": "BERTHED",
        "currentBerth": {
          "id": "berth_101",
          "code": "B-101",
          "name": "Container Berth 1"
        },
        "eta": "2025-11-02T08:00:00Z",
        "etd": "2025-11-02T20:00:00Z",
        "ata": "2025-11-02T08:15:00Z",
        "atd": null,
        "createdAt": "2025-11-01T10:00:00Z",
        "updatedAt": "2025-11-02T08:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Response Schema:**
```typescript
interface Vessel {
  id: string;
  name: string;
  imoNumber: string;        // International Maritime Organization number
  callSign: string;
  flag: string;             // Country of registration
  vesselType: VesselType;   // CONTAINER, BULK, TANKER, RO_RO, GENERAL_CARGO
  length: number;           // meters
  beam: number;             // meters (width)
  draft: number;            // meters
  grossTonnage: number;
  capacity: {
    teu?: number;           // Twenty-foot Equivalent Units (for containers)
    dwt?: number;           // Deadweight Tonnage
    maxDraft: number;
  };
  status: VesselStatus;     // EXPECTED, BERTHING, BERTHED, OPERATING, DEPARTED
  currentBerth?: {
    id: string;
    code: string;
    name: string;
  };
  eta: string;              // Estimated Time of Arrival
  etd: string;              // Estimated Time of Departure
  ata?: string;             // Actual Time of Arrival
  atd?: string;             // Actual Time of Departure
  createdAt: string;
  updatedAt: string;
}

enum VesselType {
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
  TANKER = 'TANKER',
  RO_RO = 'RO_RO',
  GENERAL_CARGO = 'GENERAL_CARGO',
}

enum VesselStatus {
  EXPECTED = 'EXPECTED',       // Not yet arrived
  BERTHING = 'BERTHING',       // In process of berthing
  BERTHED = 'BERTHED',         // Berthed at port
  OPERATING = 'OPERATING',     // Loading/Unloading operations
  DEPARTED = 'DEPARTED',       // Left the port
}
```

---

### 7.2. Get Vessel by ID

**Endpoint:** `GET /api/v1/vessels/:id`

**Description:** Get detailed vessel information including current schedule and tasks

**Authentication:** Required

**Permissions:** `view_schedule`

**Path Parameters:**
- `id` (string) - Vessel ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "vessel_001",
    "name": "MSC MARINA",
    "imoNumber": "IMO9876543",
    "callSign": "ABCD",
    "flag": "Panama",
    "vesselType": "CONTAINER",
    "length": 366.0,
    "beam": 51.2,
    "draft": 14.5,
    "grossTonnage": 150000,
    "capacity": {
      "teu": 15000,
      "maxDraft": 16.0
    },
    "status": "BERTHED",
    "currentBerth": {
      "id": "berth_101",
      "code": "B-101",
      "name": "Container Berth 1",
      "length": 400.0,
      "maxDraft": 16.5
    },
    "currentSchedule": {
      "id": "schedule_456",
      "scheduledStart": "2025-11-02T08:00:00Z",
      "scheduledEnd": "2025-11-02T20:00:00Z",
      "actualStart": "2025-11-02T08:15:00Z",
      "actualEnd": null,
      "status": "IN_PROGRESS"
    },
    "activeTasks": [
      {
        "id": "task_789",
        "type": "LOADING",
        "description": "Load 500 containers",
        "status": "IN_PROGRESS",
        "progress": 65.5,
        "assignedTo": {
          "id": "user_234",
          "fullName": "Driver A"
        }
      }
    ],
    "eta": "2025-11-02T08:00:00Z",
    "etd": "2025-11-02T20:00:00Z",
    "ata": "2025-11-02T08:15:00Z",
    "atd": null,
    "cargo": {
      "type": "CONTAINER",
      "quantity": 800,
      "unit": "TEU",
      "description": "Mixed cargo containers"
    },
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-02T08:15:00Z"
  }
}
```

---

### 7.3. Create Vessel

**Endpoint:** `POST /api/v1/vessels`

**Description:** Register a new vessel in the system

**Authentication:** Required

**Permissions:** `create_schedule`

**Request:**
```json
{
  "name": "EVER GIVEN",
  "imoNumber": "IMO9811000",
  "callSign": "HPTY",
  "flag": "Panama",
  "vesselType": "CONTAINER",
  "length": 400.0,
  "beam": 59.0,
  "draft": 16.0,
  "grossTonnage": 220000,
  "capacity": {
    "teu": 20000,
    "maxDraft": 16.5
  },
  "eta": "2025-11-05T10:00:00Z",
  "etd": "2025-11-06T18:00:00Z",
  "cargo": {
    "type": "CONTAINER",
    "quantity": 1200,
    "unit": "TEU",
    "description": "Export containers"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "vessel_002",
    "name": "EVER GIVEN",
    "imoNumber": "IMO9811000",
    "status": "EXPECTED",
    "eta": "2025-11-05T10:00:00Z",
    "createdAt": "2025-11-02T11:00:00Z"
  }
}
```

**Error Responses:**
```json
// 409 - Duplicate IMO number
{
  "success": false,
  "error": {
    "code": "DUPLICATE_IMO_NUMBER",
    "message": "Vessel with IMO number 'IMO9811000' already exists"
  }
}
```

---

### 7.4. Update Vessel Status

**Endpoint:** `PATCH /api/v1/vessels/:id/status`

**Description:** Update vessel status and arrival/departure times

**Authentication:** Required

**Permissions:** `update_schedule`

**Request:**
```json
{
  "status": "BERTHED",
  "ata": "2025-11-02T08:15:00Z",
  "currentBerthId": "berth_101"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "vessel_001",
    "status": "BERTHED",
    "ata": "2025-11-02T08:15:00Z",
    "currentBerth": {
      "id": "berth_101",
      "code": "B-101"
    },
    "updatedAt": "2025-11-02T08:15:00Z"
  }
}
```

---

## 8. Berth Management APIs

### 8.1. List Berths

**Endpoint:** `GET /api/v1/berths`

**Description:** Get all berths with current status

**Authentication:** Required

**Permissions:** `view_schedule`

**Query Parameters:**
- `status` (string, optional) - Filter: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
- `vesselType` (string, optional) - Filter by compatible vessel type

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "berth_101",
        "code": "B-101",
        "name": "Container Berth 1",
        "terminal": "Container Terminal",
        "location": {
          "latitude": 10.7769,
          "longitude": 106.7009
        },
        "specifications": {
          "length": 400.0,
          "depth": 16.5,
          "maxDraft": 16.0,
          "berthType": "CONTAINER",
          "facilities": [
            "CRANE",
            "WAREHOUSE",
            "YARD"
          ]
        },
        "status": "OCCUPIED",
        "currentVessel": {
          "id": "vessel_001",
          "name": "MSC MARINA",
          "eta": "2025-11-02T08:00:00Z",
          "etd": "2025-11-02T20:00:00Z"
        },
        "capacity": {
          "maxVessels": 1,
          "maxTEU": 20000
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2025-11-02T08:15:00Z"
      },
      {
        "id": "berth_102",
        "code": "B-102",
        "name": "Container Berth 2",
        "terminal": "Container Terminal",
        "location": {
          "latitude": 10.7770,
          "longitude": 106.7010
        },
        "specifications": {
          "length": 380.0,
          "depth": 15.5,
          "maxDraft": 15.0,
          "berthType": "CONTAINER",
          "facilities": [
            "CRANE",
            "WAREHOUSE"
          ]
        },
        "status": "AVAILABLE",
        "currentVessel": null,
        "capacity": {
          "maxVessels": 1,
          "maxTEU": 18000
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2025-11-02T06:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

**Response Schema:**
```typescript
interface Berth {
  id: string;
  code: string;
  name: string;
  terminal: string;
  location: {
    latitude: number;
    longitude: number;
  };
  specifications: {
    length: number;           // meters
    depth: number;            // meters
    maxDraft: number;         // meters
    berthType: BerthType;
    facilities: Facility[];
  };
  status: BerthStatus;
  currentVessel?: {
    id: string;
    name: string;
    eta: string;
    etd: string;
  };
  capacity: {
    maxVessels: number;
    maxTEU?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

enum BerthStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

enum BerthType {
  CONTAINER = 'CONTAINER',
  BULK = 'BULK',
  TANKER = 'TANKER',
  RO_RO = 'RO_RO',
  GENERAL = 'GENERAL',
}

enum Facility {
  CRANE = 'CRANE',
  WAREHOUSE = 'WAREHOUSE',
  YARD = 'YARD',
  FUEL_STATION = 'FUEL_STATION',
  CUSTOMS = 'CUSTOMS',
}
```

---

### 8.2. Get Berth Availability

**Endpoint:** `GET /api/v1/berths/:id/availability`

**Description:** Check berth availability for a time range

**Authentication:** Required

**Permissions:** `view_schedule`

**Path Parameters:**
- `id` (string) - Berth ID

**Query Parameters:**
- `startDate` (string, required) - ISO 8601 format
- `endDate` (string, required) - ISO 8601 format

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "berthId": "berth_101",
    "berthCode": "B-101",
    "requestedPeriod": {
      "start": "2025-11-03T00:00:00Z",
      "end": "2025-11-05T00:00:00Z"
    },
    "isAvailable": false,
    "occupiedSlots": [
      {
        "scheduleId": "schedule_456",
        "vesselName": "MSC MARINA",
        "start": "2025-11-02T08:00:00Z",
        "end": "2025-11-02T20:00:00Z"
      },
      {
        "scheduleId": "schedule_457",
        "vesselName": "MAERSK LINE",
        "start": "2025-11-04T06:00:00Z",
        "end": "2025-11-04T18:00:00Z"
      }
    ],
    "availableSlots": [
      {
        "start": "2025-11-03T00:00:00Z",
        "end": "2025-11-04T06:00:00Z",
        "duration": 30
      },
      {
        "start": "2025-11-04T18:00:00Z",
        "end": "2025-11-05T00:00:00Z",
        "duration": 6
      }
    ]
  }
}
```

---

## 9. Schedule Management APIs

### 9.1. List Schedules

**Endpoint:** `GET /api/v1/schedules`

**Description:** Get vessel berthing schedules with filters

**Authentication:** Required

**Permissions:** `view_schedule`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional) - SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- `berthId` (string, optional) - Filter by berth
- `vesselId` (string, optional) - Filter by vessel
- `startDate` (string, optional) - Filter from date
- `endDate` (string, optional) - Filter to date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "schedule_456",
        "vessel": {
          "id": "vessel_001",
          "name": "MSC MARINA",
          "imoNumber": "IMO9876543"
        },
        "berth": {
          "id": "berth_101",
          "code": "B-101",
          "name": "Container Berth 1"
        },
        "scheduledStart": "2025-11-02T08:00:00Z",
        "scheduledEnd": "2025-11-02T20:00:00Z",
        "actualStart": "2025-11-02T08:15:00Z",
        "actualEnd": null,
        "status": "IN_PROGRESS",
        "tasks": [
          {
            "id": "task_789",
            "type": "LOADING",
            "status": "IN_PROGRESS",
            "progress": 65.5
          },
          {
            "id": "task_790",
            "type": "UNLOADING",
            "status": "PENDING",
            "progress": 0
          }
        ],
        "totalTasks": 2,
        "completedTasks": 0,
        "overallProgress": 32.75,
        "createdBy": {
          "id": "user_123",
          "fullName": "John Operations"
        },
        "createdAt": "2025-11-01T15:00:00Z",
        "updatedAt": "2025-11-02T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 56,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 9.2. Get Schedule by ID

**Endpoint:** `GET /api/v1/schedules/:id`

**Description:** Get detailed schedule with all tasks and history

**Authentication:** Required

**Permissions:** `view_schedule`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_456",
    "vessel": {
      "id": "vessel_001",
      "name": "MSC MARINA",
      "imoNumber": "IMO9876543",
      "vesselType": "CONTAINER",
      "length": 366.0,
      "draft": 14.5
    },
    "berth": {
      "id": "berth_101",
      "code": "B-101",
      "name": "Container Berth 1",
      "terminal": "Container Terminal"
    },
    "scheduledStart": "2025-11-02T08:00:00Z",
    "scheduledEnd": "2025-11-02T20:00:00Z",
    "actualStart": "2025-11-02T08:15:00Z",
    "actualEnd": null,
    "status": "IN_PROGRESS",
    "priority": "NORMAL",
    "tasks": [
      {
        "id": "task_789",
        "type": "LOADING",
        "description": "Load 500 containers",
        "status": "IN_PROGRESS",
        "progress": 65.5,
        "estimatedDuration": 360,
        "actualDuration": 235,
        "assignedTo": {
          "id": "user_234",
          "fullName": "Driver A"
        },
        "equipment": [
          {
            "id": "crane_001",
            "type": "CRANE",
            "name": "STS Crane #1"
          }
        ],
        "startedAt": "2025-11-02T08:30:00Z",
        "estimatedEnd": "2025-11-02T14:30:00Z"
      },
      {
        "id": "task_790",
        "type": "UNLOADING",
        "description": "Unload 300 containers",
        "status": "PENDING",
        "progress": 0,
        "estimatedDuration": 240,
        "assignedTo": null,
        "equipment": [],
        "estimatedStart": "2025-11-02T14:30:00Z"
      }
    ],
    "totalTasks": 2,
    "completedTasks": 0,
    "overallProgress": 32.75,
    "estimatedCompletion": "2025-11-02T18:30:00Z",
    "delays": [
      {
        "reason": "Weather delay",
        "duration": 15,
        "timestamp": "2025-11-02T08:00:00Z"
      }
    ],
    "notes": "High priority cargo",
    "createdBy": {
      "id": "user_123",
      "fullName": "John Operations"
    },
    "createdAt": "2025-11-01T15:00:00Z",
    "updatedAt": "2025-11-02T10:30:00Z"
  }
}
```

---

### 9.3. Create Schedule

**Endpoint:** `POST /api/v1/schedules`

**Description:** Create a new berthing schedule with tasks

**Authentication:** Required

**Permissions:** `create_schedule`

**Request:**
```json
{
  "vesselId": "vessel_001",
  "berthId": "berth_101",
  "scheduledStart": "2025-11-05T08:00:00Z",
  "scheduledEnd": "2025-11-05T20:00:00Z",
  "priority": "HIGH",
  "tasks": [
    {
      "type": "BERTHING",
      "description": "Vessel berthing operations",
      "estimatedDuration": 60,
      "requiredEquipment": ["TUG_BOAT"],
      "assignedToId": "user_234"
    },
    {
      "type": "LOADING",
      "description": "Load 800 containers",
      "estimatedDuration": 480,
      "requiredEquipment": ["CRANE"],
      "assignedToId": "user_235"
    },
    {
      "type": "UNBERTHING",
      "description": "Vessel departure",
      "estimatedDuration": 60,
      "requiredEquipment": ["TUG_BOAT"]
    }
  ],
  "notes": "High priority shipment"
}
```

**Request Schema:**
```typescript
interface CreateScheduleRequest {
  vesselId: string;
  berthId: string;
  scheduledStart: string;     // ISO 8601
  scheduledEnd: string;       // ISO 8601
  priority?: SchedulePriority; // NORMAL, HIGH, URGENT
  tasks: CreateTaskDto[];
  notes?: string;
}

interface CreateTaskDto {
  type: TaskType;
  description: string;
  estimatedDuration: number;  // minutes
  requiredEquipment?: EquipmentType[];
  assignedToId?: string;
  dependsOn?: string[];       // Task IDs this task depends on
}

enum TaskType {
  BERTHING = 'BERTHING',
  UNBERTHING = 'UNBERTHING',
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  INSPECTION = 'INSPECTION',
  MAINTENANCE = 'MAINTENANCE',
  CUSTOMS = 'CUSTOMS',
  FUELING = 'FUELING',
}

enum SchedulePriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_458",
    "vessel": {
      "id": "vessel_001",
      "name": "MSC MARINA"
    },
    "berth": {
      "id": "berth_101",
      "code": "B-101"
    },
    "scheduledStart": "2025-11-05T08:00:00Z",
    "scheduledEnd": "2025-11-05T20:00:00Z",
    "status": "SCHEDULED",
    "priority": "HIGH",
    "totalTasks": 3,
    "createdAt": "2025-11-02T11:00:00Z"
  }
}
```

**Error Responses:**
```json
// 409 - Berth conflict
{
  "success": false,
  "error": {
    "code": "BERTH_CONFLICT",
    "message": "Berth B-101 is already occupied during the requested time",
    "details": {
      "conflictingSchedule": {
        "id": "schedule_457",
        "vesselName": "MAERSK LINE",
        "start": "2025-11-05T06:00:00Z",
        "end": "2025-11-05T10:00:00Z"
      }
    }
  }
}

// 422 - Invalid time range
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "Scheduled end time must be after start time"
  }
}
```

---

### 9.4. Update Schedule

**Endpoint:** `PATCH /api/v1/schedules/:id`

**Description:** Update schedule details

**Authentication:** Required

**Permissions:** `update_schedule`

**Request:**
```json
{
  "scheduledStart": "2025-11-05T09:00:00Z",
  "scheduledEnd": "2025-11-05T21:00:00Z",
  "priority": "URGENT",
  "notes": "Updated due to weather conditions"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_458",
    "scheduledStart": "2025-11-05T09:00:00Z",
    "scheduledEnd": "2025-11-05T21:00:00Z",
    "priority": "URGENT",
    "notes": "Updated due to weather conditions",
    "updatedAt": "2025-11-02T11:30:00Z"
  }
}
```

---

### 9.5. Cancel Schedule

**Endpoint:** `DELETE /api/v1/schedules/:id`

**Description:** Cancel a schedule

**Authentication:** Required

**Permissions:** `delete_schedule`

**Request:**
```json
{
  "reason": "Vessel delayed due to weather",
  "cancelledBy": "user_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "schedule_458",
    "status": "CANCELLED",
    "cancelledAt": "2025-11-02T12:00:00Z",
    "cancellationReason": "Vessel delayed due to weather"
  }
}
```

---

## 10. Task Management APIs

### 10.1. List Tasks

**Endpoint:** `GET /api/v1/tasks`

**Description:** Get tasks with filtering options

**Authentication:** Required

**Permissions:** `view_tasks`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `type` - Task type filter
- `assignedTo` - Filter by user ID
- `scheduleId` - Filter by schedule

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "task_789",
        "schedule": {
          "id": "schedule_456",
          "vessel": {
            "id": "vessel_001",
            "name": "MSC MARINA"
          },
          "berth": {
            "id": "berth_101",
            "code": "B-101"
          }
        },
        "type": "LOADING",
        "description": "Load 500 containers",
        "status": "IN_PROGRESS",
        "progress": 65.5,
        "priority": "NORMAL",
        "estimatedDuration": 360,
        "actualDuration": 235,
        "assignedTo": {
          "id": "user_234",
          "fullName": "Driver A",
          "phoneNumber": "+84901234567"
        },
        "equipment": [
          {
            "id": "crane_001",
            "type": "CRANE",
            "name": "STS Crane #1"
          }
        ],
        "scheduledStart": "2025-11-02T08:30:00Z",
        "scheduledEnd": "2025-11-02T14:30:00Z",
        "actualStart": "2025-11-02T08:30:00Z",
        "estimatedEnd": "2025-11-02T13:45:00Z",
        "createdAt": "2025-11-01T15:00:00Z",
        "updatedAt": "2025-11-02T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 78,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### 10.2. Update Task Status

**Endpoint:** `PATCH /api/v1/tasks/:id/status`

**Description:** Update task status and progress (used by drivers)

**Authentication:** Required

**Permissions:** `update_task_status`

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "progress": 75.0,
  "notes": "Completed 375 out of 500 containers"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "task_789",
    "status": "IN_PROGRESS",
    "progress": 75.0,
    "notes": "Completed 375 out of 500 containers",
    "updatedAt": "2025-11-02T12:00:00Z"
  }
}
```

**Status Transitions:**
```
PENDING → IN_PROGRESS → COMPLETED
         ↓
      CANCELLED
```

---

### 10.3. Assign Task

**Endpoint:** `PATCH /api/v1/tasks/:id/assign`

**Description:** Assign task to a user

**Authentication:** Required

**Permissions:** `assign_tasks`

**Request:**
```json
{
  "assignedToId": "user_235",
  "equipmentIds": ["crane_002"],
  "notes": "Assigned to Driver B with Crane #2"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "task_790",
    "assignedTo": {
      "id": "user_235",
      "fullName": "Driver B"
    },
    "equipment": [
      {
        "id": "crane_002",
        "name": "STS Crane #2"
      }
    ],
    "updatedAt": "2025-11-02T12:15:00Z"
  }
}
```

---

## 11. Simulation APIs

### 11.1. Create Simulation

**Endpoint:** `POST /api/v1/simulations`

**Description:** Create and run a What-If simulation

**Authentication:** Required

**Permissions:** `run_simulation`

**Request:**
```json
{
  "name": "Peak Season Simulation - Nov 2025",
  "description": "Simulate 20% increase in vessel arrivals",
  "baseScheduleId": "schedule_456",
  "parameters": {
    "vesselArrivalIncrease": 20,
    "averageHandlingTimeReduction": 10,
    "additionalBerthsAvailable": 1,
    "simulationPeriod": {
      "start": "2025-11-01T00:00:00Z",
      "end": "2025-11-30T23:59:59Z"
    }
  },
  "scenarios": [
    {
      "name": "Scenario 1: Current capacity",
      "changes": []
    },
    {
      "name": "Scenario 2: Add 2 cranes",
      "changes": [
        {
          "type": "ADD_EQUIPMENT",
          "equipmentType": "CRANE",
          "quantity": 2
        }
      ]
    }
  ]
}
```

**Request Schema:**
```typescript
interface CreateSimulationRequest {
  name: string;
  description?: string;
  baseScheduleId?: string;
  parameters: SimulationParameters;
  scenarios: Scenario[];
}

interface SimulationParameters {
  vesselArrivalIncrease?: number;      // percentage
  averageHandlingTimeReduction?: number; // percentage
  additionalBerthsAvailable?: number;
  simulationPeriod: {
    start: string;
    end: string;
  };
}

interface Scenario {
  name: string;
  changes: ScenarioChange[];
}

interface ScenarioChange {
  type: 'ADD_EQUIPMENT' | 'CHANGE_SCHEDULE' | 'ADD_BERTH';
  equipmentType?: string;
  quantity?: number;
  scheduleAdjustment?: any;
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "sim_001",
    "name": "Peak Season Simulation - Nov 2025",
    "status": "RUNNING",
    "progress": 0,
    "estimatedCompletionTime": "2025-11-02T12:05:00Z",
    "createdAt": "2025-11-02T12:00:00Z"
  }
}
```

---

### 11.2. Get Simulation Status

**Endpoint:** `GET /api/v1/simulations/:id`

**Description:** Get simulation progress and results

**Authentication:** Required

**Permissions:** `view_simulations`

**Response (200 OK) - Running:**
```json
{
  "success": true,
  "data": {
    "id": "sim_001",
    "name": "Peak Season Simulation - Nov 2025",
    "description": "Simulate 20% increase in vessel arrivals",
    "status": "RUNNING",
    "progress": 45.5,
    "estimatedCompletionTime": "2025-11-02T12:05:00Z",
    "createdAt": "2025-11-02T12:00:00Z",
    "startedAt": "2025-11-02T12:00:05Z"
  }
}
```

**Response (200 OK) - Completed:**
```json
{
  "success": true,
  "data": {
    "id": "sim_001",
    "name": "Peak Season Simulation - Nov 2025",
    "status": "COMPLETED",
    "progress": 100,
    "results": {
      "summary": {
        "totalVesselsProcessed": 156,
        "averageBerthUtilization": 87.5,
        "averageWaitingTime": 3.2,
        "averageTurnaroundTime": 18.5,
        "bottlenecks": [
          {
            "resource": "Crane capacity",
            "severity": "HIGH",
            "impact": "15% delay in loading operations"
          }
        ]
      },
      "scenarios": [
        {
          "name": "Scenario 1: Current capacity",
          "kpis": {
            "berthUtilization": 92.3,
            "avgWaitingTime": 4.5,
            "avgTurnaroundTime": 21.3,
            "totalRevenue": 5420000
          }
        },
        {
          "name": "Scenario 2: Add 2 cranes",
          "kpis": {
            "berthUtilization": 87.5,
            "avgWaitingTime": 2.1,
            "avgTurnaroundTime": 16.8,
            "totalRevenue": 6130000
          },
          "improvements": {
            "waitingTimeReduction": 53.3,
            "turnaroundTimeReduction": 21.1,
            "revenueIncrease": 13.1
          }
        }
      ],
      "recommendations": [
        "Add 2 additional cranes to reduce waiting time by 53%",
        "Optimize berth allocation to increase revenue by 13%"
      ]
    },
    "executionTime": 3.2,
    "createdBy": {
      "id": "user_123",
      "fullName": "John Operations"
    },
    "createdAt": "2025-11-02T12:00:00Z",
    "completedAt": "2025-11-02T12:03:12Z"
  }
}
```

---

### 11.3. List Simulations

**Endpoint:** `GET /api/v1/simulations`

**Description:** Get list of simulations

**Authentication:** Required

**Permissions:** `view_simulations`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - PENDING, RUNNING, COMPLETED, FAILED
- `createdBy` - Filter by creator

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "sim_001",
        "name": "Peak Season Simulation - Nov 2025",
        "status": "COMPLETED",
        "executionTime": 3.2,
        "createdBy": {
          "id": "user_123",
          "fullName": "John Operations"
        },
        "createdAt": "2025-11-02T12:00:00Z",
        "completedAt": "2025-11-02T12:03:12Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 15,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

---

## 12. Analytics & KPI APIs

### 12.1. Get KPI Dashboard

**Endpoint:** `GET /api/v1/analytics/kpis`

**Description:** Get real-time KPI metrics for dashboard

**Authentication:** Required

**Permissions:** `view_analytics`

**Query Parameters:**
- `period` - TODAY, WEEK, MONTH, YEAR, CUSTOM
- `startDate` - For CUSTOM period
- `endDate` - For CUSTOM period

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "type": "TODAY",
      "start": "2025-11-02T00:00:00Z",
      "end": "2025-11-02T23:59:59Z"
    },
    "kpis": {
      "berthUtilization": {
        "value": 87.5,
        "unit": "%",
        "trend": "+5.2",
        "status": "GOOD",
        "target": 85.0
      },
      "averageWaitingTime": {
        "value": 2.3,
        "unit": "hours",
        "trend": "-0.8",
        "status": "EXCELLENT",
        "target": 3.0
      },
      "averageTurnaroundTime": {
        "value": 18.5,
        "unit": "hours",
        "trend": "-1.2",
        "status": "GOOD",
        "target": 20.0
      },
      "vesselThroughput": {
        "value": 45,
        "unit": "vessels",
        "trend": "+8",
        "status": "GOOD",
        "target": 40
      },
      "containerThroughput": {
        "value": 12500,
        "unit": "TEU",
        "trend": "+1200",
        "status": "EXCELLENT",
        "target": 11000
      },
      "craneProductivity": {
        "value": 32.5,
        "unit": "moves/hour",
        "trend": "+2.1",
        "status": "GOOD",
        "target": 30.0
      },
      "onTimePerformance": {
        "value": 94.2,
        "unit": "%",
        "trend": "+3.5",
        "status": "EXCELLENT",
        "target": 90.0
      }
    },
    "lastUpdated": "2025-11-02T12:30:00Z"
  }
}
```

---

### 12.2. Get Analytics Reports

**Endpoint:** `GET /api/v1/analytics/reports`

**Description:** Get detailed analytics reports

**Authentication:** Required

**Permissions:** `view_analytics`

**Query Parameters:**
- `reportType` - VESSEL_PERFORMANCE, BERTH_EFFICIENCY, RESOURCE_UTILIZATION, REVENUE
- `period` - TODAY, WEEK, MONTH, QUARTER, YEAR
- `format` - JSON, CSV, PDF

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportType": "BERTH_EFFICIENCY",
    "period": {
      "start": "2025-11-01T00:00:00Z",
      "end": "2025-11-02T23:59:59Z"
    },
    "berths": [
      {
        "berthId": "berth_101",
        "berthCode": "B-101",
        "berthName": "Container Berth 1",
        "metrics": {
          "utilizationRate": 92.3,
          "totalVessels": 12,
          "totalOperatingHours": 44.5,
          "averageServiceTime": 18.2,
          "idleTime": 3.5,
          "revenue": 856000
        }
      },
      {
        "berthId": "berth_102",
        "berthCode": "B-102",
        "berthName": "Container Berth 2",
        "metrics": {
          "utilizationRate": 85.7,
          "totalVessels": 10,
          "totalOperatingHours": 41.1,
          "averageServiceTime": 19.5,
          "idleTime": 6.9,
          "revenue": 745000
        }
      }
    ],
    "summary": {
      "totalUtilization": 89.0,
      "totalVessels": 22,
      "totalRevenue": 1601000,
      "totalIdleTime": 10.4
    },
    "generatedAt": "2025-11-02T12:45:00Z"
  }
}
```

---

### 12.3. Export Report

**Endpoint:** `POST /api/v1/analytics/reports/export`

**Description:** Export analytics report in specified format

**Authentication:** Required

**Permissions:** `export_reports`

**Request:**
```json
{
  "reportType": "VESSEL_PERFORMANCE",
  "period": "MONTH",
  "format": "PDF",
  "filters": {
    "vesselTypes": ["CONTAINER"],
    "berthIds": ["berth_101", "berth_102"]
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "report_xyz123",
    "downloadUrl": "https://cdn.portlink.com/reports/vessel_performance_202511.pdf",
    "expiresAt": "2025-11-09T12:00:00Z",
    "fileSize": 2456789,
    "format": "PDF"
  }
}
```

---

**KẾT THÚC PART 2**

---

## Tổng kết Part 2

### Nội dung đã hoàn thành:
✅ **7. Vessel Management APIs** (4 endpoints) - List, Get, Create, Update Status  
✅ **8. Berth Management APIs** (2 endpoints) - List, Get Availability  
✅ **9. Schedule Management APIs** (5 endpoints) - List, Get, Create, Update, Cancel  
✅ **10. Task Management APIs** (3 endpoints) - List, Update Status, Assign  
✅ **11. Simulation APIs** (3 endpoints) - Create, Get Status, List  
✅ **12. Analytics & KPI APIs** (3 endpoints) - Get KPIs, Get Reports, Export  

**Tổng cộng Part 2:** 20 REST API endpoints với đầy đủ schemas, validation, error handling

### Sẵn sàng cho Part 3:
- WebSocket Events & Real-time Communication
- Error Codes Reference
- Rate Limiting Details
- API Testing Examples
- Postman Collection

---

**Version:** 1.0 - Part 2/3  
**Status:** ✅ Completed  
**Last Updated:** 02/11/2025

---
---

# PART 3: WEBSOCKET & REFERENCE

**Trạng thái:** Completed - Part 3/3  
**Last Updated:** 02/11/2025

---

## Table of Contents - Part 3

13. [WebSocket Events](#13-websocket-events)
14. [Error Codes Reference](#14-error-codes-reference)
15. [Rate Limiting & Throttling](#15-rate-limiting--throttling)
16. [API Testing Guide](#16-api-testing-guide)
17. [Postman Collection](#17-postman-collection)
18. [Changelog & Versioning](#18-changelog--versioning)

---

## 13. WebSocket Events

### 13.1. Connection Setup

**WebSocket URL:** `wss://api.portlink.com/ws`

**Connection Flow:**
```javascript
// Client-side connection
import { io } from 'socket.io-client';

const socket = io('wss://api.portlink.com', {
  auth: {
    token: 'Bearer eyJhbGc...' // JWT access token
  },
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to PortLink WebSocket');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

**Authentication:**
- JWT token required in `auth.token` during connection
- Token validated on connection and every 5 minutes
- Auto-disconnect on invalid/expired token

**Namespaces:**
```
/             - Default namespace (general events)
/schedules    - Schedule-specific events
/tasks        - Task-specific events
/simulations  - Simulation events
/analytics    - Real-time analytics
```

---

### 13.2. Client → Server Events

#### 13.2.1. Join Room

**Event:** `join:room`

**Description:** Subscribe to specific resource updates

**Payload:**
```typescript
interface JoinRoomPayload {
  room: string;  // e.g., 'schedule:456', 'vessel:001', 'berth:101'
}
```

**Example:**
```javascript
// Join schedule room
socket.emit('join:room', { room: 'schedule:456' });

// Join multiple rooms
socket.emit('join:room', { room: 'vessel:001' });
socket.emit('join:room', { room: 'berth:101' });
```

**Response:**
```javascript
socket.on('room:joined', (data) => {
  console.log('Joined room:', data.room);
  // { room: 'schedule:456', members: 5 }
});
```

---

#### 13.2.2. Leave Room

**Event:** `leave:room`

**Payload:**
```typescript
interface LeaveRoomPayload {
  room: string;
}
```

**Example:**
```javascript
socket.emit('leave:room', { room: 'schedule:456' });
```

---

#### 13.2.3. Update Task Progress

**Event:** `task:update:progress`

**Description:** Real-time task progress update (for drivers)

**Payload:**
```typescript
interface TaskProgressUpdate {
  taskId: string;
  progress: number;  // 0-100
  notes?: string;
}
```

**Example:**
```javascript
socket.emit('task:update:progress', {
  taskId: 'task_789',
  progress: 75.5,
  notes: 'Loaded 377 containers'
});
```

**Response:**
```javascript
socket.on('task:progress:updated', (data) => {
  console.log('Progress updated:', data);
  // { taskId: 'task_789', progress: 75.5, updatedAt: '...' }
});
```

---

### 13.3. Server → Client Events

#### 13.3.1. Schedule Created

**Event:** `schedule:created`

**Description:** New schedule created

**Payload:**
```typescript
interface ScheduleCreatedEvent {
  type: 'schedule:created';
  data: {
    id: string;
    vessel: {
      id: string;
      name: string;
    };
    berth: {
      id: string;
      code: string;
    };
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    createdBy: {
      id: string;
      fullName: string;
    };
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('schedule:created', (event) => {
  console.log('New schedule:', event.data);
  // Update UI with new schedule
  updateScheduleBoard(event.data);
});
```

---

#### 13.3.2. Schedule Updated

**Event:** `schedule:updated`

**Description:** Schedule details changed

**Payload:**
```typescript
interface ScheduleUpdatedEvent {
  type: 'schedule:updated';
  data: {
    id: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    updatedBy: {
      id: string;
      fullName: string;
    };
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('schedule:updated', (event) => {
  console.log('Schedule updated:', event.data);
  // { 
  //   id: 'schedule_456',
  //   changes: [
  //     { field: 'scheduledStart', oldValue: '...', newValue: '...' }
  //   ]
  // }
});
```

---

#### 13.3.3. Task Status Changed

**Event:** `task:status:changed`

**Description:** Task status or progress updated

**Payload:**
```typescript
interface TaskStatusChangedEvent {
  type: 'task:status:changed';
  data: {
    id: string;
    scheduleId: string;
    status: TaskStatus;
    progress: number;
    previousStatus: TaskStatus;
    assignedTo?: {
      id: string;
      fullName: string;
    };
    updatedAt: string;
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('task:status:changed', (event) => {
  console.log('Task status:', event.data);
  // Update task card in UI
  updateTaskStatus(event.data.id, event.data.status, event.data.progress);
});
```

---

#### 13.3.4. Vessel Arrived/Departed

**Event:** `vessel:arrival` | `vessel:departure`

**Payload:**
```typescript
interface VesselMovementEvent {
  type: 'vessel:arrival' | 'vessel:departure';
  data: {
    id: string;
    name: string;
    berth?: {
      id: string;
      code: string;
    };
    ata?: string;  // Actual Time of Arrival
    atd?: string;  // Actual Time of Departure
    status: VesselStatus;
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('vessel:arrival', (event) => {
  console.log('Vessel arrived:', event.data.name);
  showNotification(`${event.data.name} has arrived at ${event.data.berth.code}`);
});

socket.on('vessel:departure', (event) => {
  console.log('Vessel departed:', event.data.name);
  updateVesselStatus(event.data.id, 'DEPARTED');
});
```

---

#### 13.3.5. Berth Status Changed

**Event:** `berth:status:changed`

**Payload:**
```typescript
interface BerthStatusChangedEvent {
  type: 'berth:status:changed';
  data: {
    id: string;
    code: string;
    status: BerthStatus;
    previousStatus: BerthStatus;
    currentVessel?: {
      id: string;
      name: string;
    };
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('berth:status:changed', (event) => {
  console.log('Berth status:', event.data);
  // Update berth visualization
  updateBerthColor(event.data.id, event.data.status);
});
```

---

#### 13.3.6. Simulation Completed

**Event:** `simulation:completed`

**Payload:**
```typescript
interface SimulationCompletedEvent {
  type: 'simulation:completed';
  data: {
    id: string;
    name: string;
    status: 'COMPLETED' | 'FAILED';
    executionTime: number;
    results?: {
      summary: any;
      scenarios: any[];
      recommendations: string[];
    };
    error?: string;
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('simulation:completed', (event) => {
  console.log('Simulation done:', event.data.name);
  if (event.data.status === 'COMPLETED') {
    displaySimulationResults(event.data.results);
  } else {
    showError('Simulation failed: ' + event.data.error);
  }
});
```

---

#### 13.3.7. KPI Updated

**Event:** `kpi:updated`

**Description:** Real-time KPI metrics update (every 30 seconds)

**Payload:**
```typescript
interface KPIUpdatedEvent {
  type: 'kpi:updated';
  data: {
    berthUtilization: number;
    averageWaitingTime: number;
    averageTurnaroundTime: number;
    vesselThroughput: number;
    containerThroughput: number;
    craneProductivity: number;
    onTimePerformance: number;
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('kpi:updated', (event) => {
  console.log('KPIs updated:', event.data);
  // Update dashboard charts
  updateKPIDashboard(event.data);
});
```

---

#### 13.3.8. Conflict Detected

**Event:** `conflict:detected`

**Description:** Schedule conflict or resource constraint detected

**Payload:**
```typescript
interface ConflictDetectedEvent {
  type: 'conflict:detected';
  data: {
    conflictType: 'BERTH_OVERLAP' | 'RESOURCE_UNAVAILABLE' | 'TIME_CONSTRAINT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedSchedules: string[];
    description: string;
    recommendations: string[];
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('conflict:detected', (event) => {
  console.log('Conflict:', event.data);
  if (event.data.severity === 'CRITICAL') {
    showAlert('Critical conflict detected!', event.data.description);
  }
});
```

---

#### 13.3.9. Notification

**Event:** `notification`

**Description:** General system notifications

**Payload:**
```typescript
interface NotificationEvent {
  type: 'notification';
  data: {
    id: string;
    title: string;
    message: string;
    category: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    priority: 'LOW' | 'NORMAL' | 'HIGH';
    actionUrl?: string;
    expiresAt?: string;
  };
  timestamp: string;
}
```

**Example:**
```javascript
socket.on('notification', (event) => {
  console.log('Notification:', event.data);
  showToast(event.data.title, event.data.message, event.data.category);
});
```

---

### 13.4. WebSocket Error Handling

**Error Events:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // { code: 'UNAUTHORIZED', message: 'Invalid token' }
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Retry connection or show offline mode
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected (e.g., token expired)
    refreshTokenAndReconnect();
  } else {
    // Network issue, will auto-reconnect
    showOfflineIndicator();
  }
});
```

---

### 13.5. Room-based Broadcasting

**Room Structure:**
```
Global Rooms (auto-joined based on role):
- all                    → All authenticated users
- role:ADMIN             → Admin users only
- role:MANAGER           → Manager users
- role:OPERATIONS        → Operations users
- role:DRIVER            → Driver users

Resource Rooms (manual join):
- schedule:{id}          → Specific schedule updates
- vessel:{id}            → Specific vessel updates
- berth:{id}             → Specific berth updates
- simulation:{id}        → Specific simulation updates
- task:{id}              → Specific task updates
```

**Example Usage:**
```javascript
// Join schedule room to receive real-time updates
socket.emit('join:room', { room: 'schedule:456' });

// All users in 'schedule:456' room will receive this event
socket.on('schedule:updated', (event) => {
  // Only if you're in the room
  console.log('Schedule 456 updated:', event.data);
});

// Leave room when navigating away
socket.emit('leave:room', { room: 'schedule:456' });
```

---

### 13.6. Complete WebSocket Example

```typescript
// websocket.service.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket;
  
  connect(token: string) {
    this.socket = io('wss://api.portlink.com', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    // Schedule events
    this.socket.on('schedule:created', (event) => {
      this.handleScheduleCreated(event.data);
    });
    
    this.socket.on('schedule:updated', (event) => {
      this.handleScheduleUpdated(event.data);
    });
    
    // Task events
    this.socket.on('task:status:changed', (event) => {
      this.handleTaskStatusChanged(event.data);
    });
    
    // KPI events
    this.socket.on('kpi:updated', (event) => {
      this.handleKPIUpdate(event.data);
    });
    
    // Conflict alerts
    this.socket.on('conflict:detected', (event) => {
      this.handleConflictDetected(event.data);
    });
  }
  
  // Join specific resource room
  joinSchedule(scheduleId: string) {
    this.socket.emit('join:room', { room: `schedule:${scheduleId}` });
  }
  
  // Update task progress (for drivers)
  updateTaskProgress(taskId: string, progress: number, notes?: string) {
    this.socket.emit('task:update:progress', {
      taskId,
      progress,
      notes,
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new WebSocketService();
```

---

## 14. Error Codes Reference

### 14.1. Complete Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| **AUTHENTICATION_ERROR** | 401 | Invalid or missing authentication | Provide valid JWT token |
| **INVALID_CREDENTIALS** | 401 | Wrong username or password | Check credentials |
| **TOKEN_EXPIRED** | 401 | JWT token has expired | Refresh token |
| **INVALID_REFRESH_TOKEN** | 401 | Refresh token invalid/expired | Re-login required |
| **ACCOUNT_LOCKED** | 403 | Account locked (too many failed logins) | Wait or contact admin |
| **INSUFFICIENT_PERMISSIONS** | 403 | User lacks required permissions | Request access from admin |
| **RESOURCE_NOT_FOUND** | 404 | Requested resource doesn't exist | Check resource ID |
| **USER_NOT_FOUND** | 404 | User not found | Verify user ID |
| **VESSEL_NOT_FOUND** | 404 | Vessel not found | Verify vessel ID |
| **SCHEDULE_NOT_FOUND** | 404 | Schedule not found | Verify schedule ID |
| **BERTH_NOT_FOUND** | 404 | Berth not found | Verify berth ID |
| **VALIDATION_ERROR** | 422 | Request validation failed | Fix validation errors |
| **WEAK_PASSWORD** | 422 | Password doesn't meet requirements | Use stronger password |
| **INVALID_TIME_RANGE** | 422 | Invalid start/end times | Check time range |
| **USERNAME_ALREADY_EXISTS** | 409 | Username is taken | Choose different username |
| **EMAIL_ALREADY_EXISTS** | 409 | Email already registered | Use different email |
| **DUPLICATE_IMO_NUMBER** | 409 | Vessel IMO already exists | Check IMO number |
| **BERTH_CONFLICT** | 409 | Berth occupied during requested time | Choose different time/berth |
| **BERTH_OCCUPIED** | 409 | Berth currently occupied | Wait or use different berth |
| **RESOURCE_CONFLICT** | 409 | Resource unavailable | Resolve conflict |
| **SCHEDULE_CONFLICT** | 409 | Conflicting schedules | Adjust schedule time |
| **CANNOT_DELETE_SELF** | 403 | Cannot delete own account | Use different admin |
| **RATE_LIMIT_EXCEEDED** | 429 | Too many requests | Wait before retrying |
| **INTERNAL_SERVER_ERROR** | 500 | Unexpected server error | Contact support |
| **SERVICE_UNAVAILABLE** | 503 | Service temporarily down | Try again later |
| **DATABASE_ERROR** | 500 | Database operation failed | Contact support |
| **SIMULATION_ERROR** | 500 | Simulation execution failed | Check simulation parameters |

---

### 14.2. Error Response Examples

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "value": "invalid-email",
        "message": "Must be a valid email address",
        "constraint": "isEmail"
      },
      {
        "field": "password",
        "value": "123",
        "message": "Password must be at least 8 characters",
        "constraint": "minLength"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-02T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Business Logic Error:**
```json
{
  "success": false,
  "error": {
    "code": "BERTH_CONFLICT",
    "message": "Berth B-101 is already occupied during the requested time",
    "details": {
      "berthId": "berth_101",
      "berthCode": "B-101",
      "requestedPeriod": {
        "start": "2025-11-05T08:00:00Z",
        "end": "2025-11-05T20:00:00Z"
      },
      "conflictingSchedule": {
        "id": "schedule_457",
        "vesselName": "MAERSK LINE",
        "start": "2025-11-05T06:00:00Z",
        "end": "2025-11-05T10:00:00Z"
      },
      "suggestions": [
        "Choose different berth (B-102 is available)",
        "Adjust start time to 2025-11-05T10:00:00Z or later"
      ]
    }
  }
}
```

---

## 15. Rate Limiting & Throttling

### 15.1. Rate Limit Tiers

| User Type | Requests/Minute | Burst Limit | Window |
|-----------|-----------------|-------------|--------|
| Anonymous | 10 | 20 | 1 minute |
| Authenticated | 100 | 150 | 1 minute |
| Admin | 1000 | 1500 | 1 minute |
| System/Service | Unlimited | - | - |

### 15.2. Rate Limit Headers

**Every response includes:**
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698930060
X-RateLimit-RetryAfter: 60
```

**Header Descriptions:**
- `X-RateLimit-Limit`: Maximum requests allowed in window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `X-RateLimit-RetryAfter`: Seconds until you can retry (only on 429)

### 15.3. Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 100,
      "window": 60,
      "retryAfter": 45
    }
  }
}
```

### 15.4. Endpoint-Specific Limits

| Endpoint Category | Custom Limit | Reason |
|-------------------|--------------|--------|
| POST /auth/login | 5/minute | Prevent brute force |
| POST /simulations | 10/hour | Resource intensive |
| POST /analytics/reports/export | 20/hour | Heavy operation |
| WebSocket connections | 5 concurrent | Connection limit |

---

## 16. API Testing Guide

### 16.1. Authentication Test

```bash
# 1. Login
curl -X POST https://api.portlink.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.ops",
    "password": "SecurePassword123!"
  }'

# Response: Save accessToken
# TOKEN="eyJhbGc..."

# 2. Test authenticated endpoint
curl -X GET https://api.portlink.com/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 16.2. CRUD Operations Test

```bash
# Create vessel
curl -X POST https://api.portlink.com/api/v1/vessels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TEST VESSEL",
    "imoNumber": "IMO9999999",
    "vesselType": "CONTAINER",
    "length": 300,
    "eta": "2025-11-10T08:00:00Z"
  }'

# List vessels
curl -X GET "https://api.portlink.com/api/v1/vessels?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Update vessel status
curl -X PATCH https://api.portlink.com/api/v1/vessels/vessel_001/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "BERTHED",
    "ata": "2025-11-02T08:15:00Z"
  }'
```

### 16.3. WebSocket Connection Test

```javascript
// test-websocket.js
const io = require('socket.io-client');

const TOKEN = 'your_jwt_token_here';

const socket = io('wss://api.portlink.com', {
  auth: { token: `Bearer ${TOKEN}` },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Join a room
  socket.emit('join:room', { room: 'schedule:456' });
});

socket.on('room:joined', (data) => {
  console.log('✅ Joined room:', data);
});

socket.on('schedule:updated', (event) => {
  console.log('📅 Schedule updated:', event.data);
});

socket.on('task:status:changed', (event) => {
  console.log('✅ Task status:', event.data);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});

// Keep alive for 30 seconds
setTimeout(() => {
  socket.disconnect();
  console.log('Disconnected');
  process.exit(0);
}, 30000);
```

---

## 17. Postman Collection

### 17.1. Environment Variables

```json
{
  "name": "PortLink Production",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://api.portlink.com/api/v1",
      "enabled": true
    },
    {
      "key": "accessToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "refreshToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

### 17.2. Pre-request Script (Auto-login)

```javascript
// Postman Pre-request Script
const loginUrl = pm.environment.get('baseUrl') + '/auth/login';

if (!pm.environment.get('accessToken')) {
  pm.sendRequest({
    url: loginUrl,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        username: 'john.ops',
        password: 'SecurePassword123!'
      })
    }
  }, (err, response) => {
    if (!err) {
      const data = response.json();
      pm.environment.set('accessToken', data.data.tokens.accessToken);
      pm.environment.set('refreshToken', data.data.tokens.refreshToken);
    }
  });
}
```

### 17.3. Sample Collection Structure

```
PortLink Orchestrator API/
├── Authentication/
│   ├── Login
│   ├── Refresh Token
│   ├── Logout
│   ├── Get Profile
│   └── Change Password
│
├── User Management/
│   ├── List Users
│   ├── Create User
│   ├── Update User
│   └── Delete User
│
├── Vessels/
│   ├── List Vessels
│   ├── Get Vessel
│   ├── Create Vessel
│   └── Update Vessel Status
│
├── Schedules/
│   ├── List Schedules
│   ├── Get Schedule
│   ├── Create Schedule
│   ├── Update Schedule
│   └── Cancel Schedule
│
├── Tasks/
│   ├── List Tasks
│   ├── Update Task Status
│   └── Assign Task
│
├── Simulations/
│   ├── Create Simulation
│   ├── Get Simulation
│   └── List Simulations
│
└── Analytics/
    ├── Get KPIs
    ├── Get Reports
    └── Export Report
```

**Download Link:** `https://portlink.com/docs/postman-collection.json`

---

## 18. Changelog & Versioning

### 18.1. API Version History

#### v1.0.0 (Current) - 2025-11-02
**Initial Release**

**Features:**
- ✅ Complete Authentication & Authorization with JWT
- ✅ User Management (CRUD)
- ✅ Vessel Management
- ✅ Berth Management
- ✅ Schedule Management with conflict detection
- ✅ Task Management with real-time updates
- ✅ What-If Simulation engine
- ✅ Analytics & KPI Dashboard
- ✅ WebSocket real-time events
- ✅ Rate limiting & security

**Endpoints:** 32 REST APIs + 9 WebSocket events

---

### 18.2. Upcoming Features (v1.1.0)

**Planned for:** 2025-12-01

**New Features:**
- 🔄 Equipment Management APIs (Cranes, Tugboats, Vehicles)
- 🔄 Advanced Analytics (Predictive models)
- 🔄 Weather Integration API
- 🔄 Mobile App specific endpoints
- 🔄 Batch operations support
- 🔄 GraphQL API alternative

**Improvements:**
- Enhanced simulation algorithms
- Better conflict resolution suggestions
- Performance optimizations
- Extended WebSocket events

---

### 18.3. Deprecation Policy

**Timeline:**
- New features added continuously
- Breaking changes announced 3 months in advance
- Deprecated endpoints supported for 12 months
- Deprecation warnings in response headers

**Example Deprecation Header:**
```http
Deprecation: version="v1", date="2026-01-01"
Sunset: Wed, 01 Jan 2026 00:00:00 GMT
Link: <https://api.portlink.com/v2/schedules>; rel="successor-version"
```

---

### 18.4. Migration Guide (When needed)

**Future v2.0.0 Migration:**
```
v1.0 → v2.0 Changes (TBD):
- Breaking: Response format restructured
- Breaking: Date format changed to ISO 8601 only
- New: Pagination cursor-based instead of offset
- New: Filtering uses RSQL syntax
- Removed: Deprecated endpoints from v1.0
```

---

## 19. Support & Resources

### 19.1. API Documentation

- **Live Docs:** https://api.portlink.com/docs (Swagger/OpenAPI)
- **Interactive Playground:** https://api.portlink.com/playground
- **GitHub Repository:** https://github.com/portlink/api-docs
- **Postman Collection:** https://portlink.com/postman

### 19.2. Developer Support

- **Email:** api-support@portlink.com
- **Discord:** https://discord.gg/portlink-dev
- **Issue Tracker:** https://github.com/portlink/issues
- **Response Time:** < 24 hours (business days)

### 19.3. Service Status

- **Status Page:** https://status.portlink.com
- **Uptime SLA:** 99.9%
- **Maintenance Window:** Sundays 01:00-03:00 UTC

### 19.4. Code Examples

**Repository:** https://github.com/portlink/examples

```
portlink-examples/
├── javascript/
│   ├── react-dashboard/
│   ├── node-backend/
│   └── websocket-client/
├── python/
│   ├── data-analytics/
│   └── automation-scripts/
├── csharp/
│   └── desktop-client/
└── mobile/
    ├── react-native/
    └── flutter/
```

---

**KẾT THÚC PART 3**

---

## Tổng kết toàn bộ API Specification Document

### Part 1: Foundation ✅
- Introduction & API Overview
- Authentication & Authorization (JWT, RBAC)
- Common Patterns (Pagination, Filtering, Error Handling)
- Authentication Module APIs (6 endpoints)
- User Management APIs (6 endpoints)

### Part 2: Operations & Analytics ✅
- Vessel Management APIs (4 endpoints)
- Berth Management APIs (2 endpoints)
- Schedule Management APIs (5 endpoints)
- Task Management APIs (3 endpoints)
- Simulation APIs (3 endpoints)
- Analytics & KPI APIs (3 endpoints)

### Part 3: WebSocket & Reference ✅
- WebSocket Events (9 events: schedule, task, vessel, berth, simulation, KPI, conflict, notification)
- Error Codes Reference (30+ error codes)
- Rate Limiting & Throttling
- API Testing Guide (cURL, WebSocket)
- Postman Collection
- Changelog & Versioning

---

**Thống kê:**
- **Total REST APIs:** 32 endpoints
- **WebSocket Events:** 9 event types
- **Error Codes:** 30+ codes
- **Total Pages:** ~180 pages
- **Code Examples:** 50+ examples

---

**Version:** 1.0 - Complete (3/3 Parts)  
**Status:** ✅ Production Ready  
**Last Updated:** 02/11/2025

---

## Next Steps

Tài liệu tiếp theo cần tạo:
1. **Deployment Plan Document** - Docker deployment, automation, cPanel integration
2. **User Manual & Guide** - Hướng dẫn cho từng persona (P-1, P-2, P-3, P-4)

Bạn muốn tiếp tục với tài liệu nào? 🚀

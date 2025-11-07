# PortLink Orchestrator API - Test Requests

## Base URL
```
http://localhost:3000/api/v1
```

## 1. Authentication

### Register New User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@portlink.com",
  "password": "Test@123",
  "fullName": "Test User"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@portlink.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@portlink.com",
      "role": "ADMIN",
      "fullName": "System Administrator"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Verify Token
```http
POST /api/v1/auth/verify
Authorization: Bearer {accessToken}
```

### Change Password
```http
POST /api/v1/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "Admin@123",
  "newPassword": "NewAdmin@123"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer {accessToken}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

## 2. Users Management

### Get All Users (Admin/Manager only)
```http
GET /api/v1/users
Authorization: Bearer {accessToken}
```

### Get My Profile
```http
GET /api/v1/users/profile
Authorization: Bearer {accessToken}
```

### Update My Profile
```http
PATCH /api/v1/users/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "+84123456789",
  "language": "vi"
}
```

### Create User (Admin only)
```http
POST /api/v1/users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@portlink.com",
  "password": "NewUser@123",
  "role": "OPERATIONS",
  "fullName": "New User"
}
```

### Get User by ID (Admin/Manager only)
```http
GET /api/v1/users/{userId}
Authorization: Bearer {accessToken}
```

### Update User (Admin only)
```http
PATCH /api/v1/users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "role": "MANAGER",
  "isActive": true
}
```

### Deactivate User (Admin only)
```http
PATCH /api/v1/users/{userId}/deactivate
Authorization: Bearer {accessToken}
```

### Activate User (Admin only)
```http
PATCH /api/v1/users/{userId}/activate
Authorization: Bearer {accessToken}
```

### Delete User (Admin only)
```http
DELETE /api/v1/users/{userId}
Authorization: Bearer {accessToken}
```

## Role-Based Access Control

- **ADMIN**: Full access to all endpoints
- **MANAGER**: Can view users, manage operations
- **OPERATIONS**: Can view own profile, update profile
- **DRIVER**: Can view own profile, update profile

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with ID xxx not found",
  "error": "Not Found"
}
```

## Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portlink.com","password":"Admin@123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Users
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

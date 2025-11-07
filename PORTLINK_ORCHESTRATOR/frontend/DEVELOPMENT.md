# PortLink Orchestrator - Development Guide

**Complete development workflow, architecture, and best practices**

---

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Coding Standards](#coding-standards)
- [State Management](#state-management)
- [Component Patterns](#component-patterns)
- [API Integration](#api-integration)
- [WebSocket Integration](#websocket-integration)
- [Theming & Styling](#theming--styling)
- [Forms & Validation](#forms--validation)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [Debugging](#debugging)
- [Git Workflow](#git-workflow)

---

## 🚀 Development Setup

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd PORTLINK_ORCHESTRATOR/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Editor Setup (VS Code Recommended)

**Required Extensions:**
- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- Material Icon Theme (optional)

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 🏗 Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React App (main.tsx)               │
├─────────────────────────────────────────────────────┤
│  ErrorBoundary → ThemeModeProvider → ToastProvider  │
├─────────────────────────────────────────────────────┤
│              Redux Store (Centralized State)         │
│  ┌───────────┬──────────┬──────────┬─────────────┐ │
│  │ Auth Slice│ KPI Slice│Task Slice│ ... Slices │ │
│  └───────────┴──────────┴──────────┴─────────────┘ │
├─────────────────────────────────────────────────────┤
│                React Router (Navigation)             │
│  ┌──────────┬─────────────┬──────────────────────┐ │
│  │Dashboard │ Ship Visits │ Schedules & Tasks ... │ │
│  └──────────┴─────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────┤
│        Feature Modules (Feature-based structure)     │
│  ┌────────────────────────────────────────────────┐ │
│  │ Each feature:                                   │ │
│  │ - Slice (Redux)                                │ │
│  │ - Components (UI)                              │ │
│  │ - Hooks (useFeatureSocket, etc.)               │ │
│  └────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  API Layer        │     WebSocket Layer             │
│  (axios config)   │     (Socket.IO client)          │
└─────────────────────────────────────────────────────┘
          │                      │
          ▼                      ▼
    Backend REST API      Backend WebSocket Server
```

### Feature-Based Structure

Each feature module follows this pattern:

```
features/
└── featureName/
    ├── featureSlice.ts        # Redux slice (state + thunks)
    ├── FeatureList.tsx        # List view component
    ├── FeatureFilters.tsx     # Filters component
    ├── FeatureDetailModal.tsx # Detail modal
    ├── FeatureForm.tsx        # Create/edit form (optional)
    ├── FeatureStats.tsx       # Statistics dashboard (optional)
    └── useFeatureSocket.ts    # WebSocket integration hook
```

**Benefits:**
- Co-location of related code
- Easy to navigate and maintain
- Clear separation of concerns
- Reusable patterns

---

## 📝 Coding Standards

### TypeScript Guidelines

**1. Type Safety**
```typescript
// ✅ GOOD: Explicit types
interface User {
  id: string;
  username: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ BAD: Using any
const fetchUser = async (id: any): Promise<any> => {
  // ...
};
```

**2. Import Types**
```typescript
// ✅ GOOD: Use import type for types (verbatimModuleSyntax)
import type { ReactNode } from 'react';
import type { User } from './types';

// ❌ BAD: Regular import for types
import { ReactNode } from 'react';
```

**3. Avoid Type Assertions**
```typescript
// ✅ GOOD: Type guards
const isUser = (value: unknown): value is User => {
  return typeof value === 'object' && value !== null && 'id' in value;
};

if (isUser(data)) {
  console.log(data.username);
}

// ❌ BAD: Type assertions
const user = data as User; // Dangerous!
```

### Naming Conventions

- **Components**: `PascalCase` (e.g., `UserProfile`, `ShipVisitList`)
- **Functions**: `camelCase` (e.g., `fetchUsers`, `handleSubmit`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_RETRY`)
- **Interfaces/Types**: `PascalCase` (e.g., `User`, `ApiResponse`)
- **Files**: Match component/function name (e.g., `UserProfile.tsx`, `api.ts`)

### File Organization

```typescript
// Order: imports → types → component → exports

// 1. External imports (React, libraries)
import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

// 2. Internal imports (grouped by feature)
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from './usersSlice';

// 3. Type imports
import type { User } from './types';

// 4. Component definition
export const UserList: React.FC = () => {
  // Hooks first
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.users.list);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Event handlers
  const handleSelect = (id: string) => {
    setSelected(id);
  };

  // Render
  return (
    <Box>
      {/* JSX */}
    </Box>
  );
};

export default UserList;
```

---

## 🗄 State Management

### Redux Toolkit Patterns

**1. Create Slice**
```typescript
// features/users/usersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/api/axios.config';
import type { User } from './types';

interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await axiosInstance.get<User[]>('/users');
    return response.data;
  }
);

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export const { setSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
```

**2. Use in Components**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, setSelectedUser } from './usersSlice';

export const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector(state => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <Box>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert error={error} />}
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user}
          onClick={() => dispatch(setSelectedUser(user))}
        />
      ))}
    </Box>
  );
};
```

---

## 🎨 Component Patterns

### 1. Functional Component with Props

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
}

export const CustomButton: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'contained',
  disabled = false,
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </Button>
  );
};
```

### 2. Component with Children

```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, actions }) => {
  return (
    <MuiCard>
      <CardHeader title={title} />
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};
```

### 3. Custom Hooks

```typescript
// hooks/useDebounce.ts
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchUsers(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 🔌 API Integration

### Axios Configuration

```typescript
// api/axios.config.ts
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/auth/refresh', { refreshToken });
        localStorage.setItem('access_token', response.data.accessToken);
        // Retry original request
        error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axios(error.config);
      } catch {
        // Logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🔄 WebSocket Integration

```typescript
// features/users/useUsersSocket.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addUserRealtime, updateUserRealtime } from './usersSlice';
import io from 'socket.io-client';

let socket: any = null;

export const useUsersSocket = () => {
  const dispatch = useAppDispatch();
  const { access_token } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!access_token) return;

    socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token: access_token },
      transports: ['websocket'],
    });

    socket.emit('join:users');

    socket.on('user:created', (user) => {
      dispatch(addUserRealtime(user));
    });

    socket.on('user:updated', (user) => {
      dispatch(updateUserRealtime(user));
    });

    return () => {
      socket.emit('leave:users');
      socket.off('user:created');
      socket.off('user:updated');
      socket.disconnect();
      socket = null;
    };
  }, [access_token, dispatch]);
};
```

---

## 🐛 Debugging

### Browser DevTools

**Redux DevTools:**
```bash
# Install extension
# Chrome: Redux DevTools
# Firefox: Redux DevTools

# View state, actions, time-travel debugging
```

**React DevTools:**
```bash
# Install extension
# Inspect component tree, props, state
```

### Console Logging

```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Data:', data);
}

// Production: Use proper logging service
```

### TypeScript Errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix common issues
# 1. Use "import type" for types
# 2. Check tsconfig.json
# 3. Clear cache: rm -rf node_modules .vite
```

---

## 📦 Git Workflow

### Branch Strategy

```bash
# Main branches
main          # Production code
develop       # Development branch

# Feature branches
feature/user-management
feature/dashboard-charts

# Fix branches
fix/login-bug
fix/navigation-issue
```

### Commit Messages

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
test: Add tests
chore: Maintenance

# Examples:
git commit -m "feat(auth): add refresh token logic"
git commit -m "fix(dashboard): correct KPI calculation"
git commit -m "docs(readme): update installation steps"
```

---

**Development Guide - Version 1.0**

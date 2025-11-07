# PortLink Orchestrator - Testing Guide

**Testing strategy, patterns, and best practices for frontend application**

---

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Setup](#setup)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Redux Testing](#redux-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing Strategy](#e2e-testing-strategy)
- [Coverage Goals](#coverage-goals)
- [Best Practices](#best-practices)

---

## 🎯 Testing Philosophy

### Testing Pyramid

```
        ╱╲
       ╱E2E╲         ← Few (5-10% of tests)
      ╱─────╲           - Critical user journeys
     ╱Integ. ╲       ← Some (20-30% of tests)
    ╱─────────╲         - Feature workflows
   ╱  Unit     ╲     ← Many (60-75% of tests)
  ╱─────────────╲      - Functions, utilities, hooks
 ╱───────────────╲
```

### Test-Driven Development (TDD)

**Red → Green → Refactor Cycle:**

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code quality

**Benefits:**
- Better code design
- Fewer bugs
- Living documentation
- Confidence in refactoring

---

## 🛠 Setup

### Install Dependencies

```bash
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  jsdom
```

### Configuration

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
    },
  },
});
```

**src/setupTests.ts:**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.VITE_WS_URL = 'http://localhost:3000';
```

**package.json Scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 🧪 Unit Testing

### Testing Utilities

**src/utils/formatters.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from './formatters';

describe('formatDate', () => {
  it('formats date to ISO string', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2025-01-15');
  });

  it('handles null input', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('handles invalid date', () => {
    expect(formatDate(new Date('invalid'))).toBe('-');
  });
});

describe('formatCurrency', () => {
  it('formats USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});
```

### Testing Custom Hooks

**src/hooks/useDebounce.test.ts:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    // Wait for debounce
    await waitFor(() => {
      expect(result.current).toBe('updated');
    }, { timeout: 600 });
  });
});
```

---

## 🎨 Component Testing

### Basic Component Test

**src/components/common/LoadingSpinner.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<LoadingSpinner message="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders with correct size', () => {
    const { container } = render(<LoadingSpinner size={60} />);
    const spinner = container.querySelector('.MuiCircularProgress-root');
    expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
  });
});
```

### Testing User Interactions

**src/components/common/ErrorAlert.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ErrorAlert from './ErrorAlert';

describe('ErrorAlert', () => {
  it('renders error message', () => {
    render(<ErrorAlert error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<ErrorAlert error="Error" onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays with correct severity', () => {
    const { container } = render(
      <ErrorAlert error="Warning" severity="warning" />
    );
    expect(container.querySelector('.MuiAlert-standardWarning')).toBeInTheDocument();
  });
});
```

### Testing Forms

**src/features/auth/LoginForm.test.tsx:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from './LoginForm';
import authReducer from './authSlice';

const createMockStore = () => configureStore({
  reducer: { auth: authReducer },
});

describe('LoginForm', () => {
  it('renders form fields', () => {
    render(
      <Provider store={createMockStore()}>
        <LoginForm />
      </Provider>
    );
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <Provider store={createMockStore()}>
        <LoginForm />
      </Provider>
    );
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits valid form', async () => {
    const user = userEvent.setup();
    
    render(
      <Provider store={createMockStore()}>
        <LoginForm />
      </Provider>
    );
    
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'TestPass123!');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Assertions for successful submission
  });
});
```

---

## 🗄 Redux Testing

### Testing Slices

**src/features/shipVisits/shipVisitsSlice.test.ts:**
```typescript
import { describe, it, expect } from 'vitest';
import shipVisitsReducer, {
  setSelectedShipVisit,
  clearError,
  fetchShipVisits,
} from './shipVisitsSlice';
import type { ShipVisitsState } from './types';

describe('shipVisitsSlice', () => {
  const initialState: ShipVisitsState = {
    shipVisits: [],
    selectedShipVisit: null,
    loading: false,
    error: null,
  };

  it('returns initial state', () => {
    expect(shipVisitsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('handles setSelectedShipVisit', () => {
    const shipVisit = { id: '1', shipName: 'MSC Oscar' };
    const actual = shipVisitsReducer(
      initialState,
      setSelectedShipVisit(shipVisit)
    );
    expect(actual.selectedShipVisit).toEqual(shipVisit);
  });

  it('handles clearError', () => {
    const stateWithError = { ...initialState, error: 'Error occurred' };
    const actual = shipVisitsReducer(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });

  describe('fetchShipVisits', () => {
    it('handles pending state', () => {
      const actual = shipVisitsReducer(
        initialState,
        fetchShipVisits.pending('requestId', undefined)
      );
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('handles fulfilled state', () => {
      const shipVisits = [{ id: '1', shipName: 'Ship 1' }];
      const actual = shipVisitsReducer(
        initialState,
        fetchShipVisits.fulfilled(shipVisits, 'requestId', undefined)
      );
      expect(actual.loading).toBe(false);
      expect(actual.shipVisits).toEqual(shipVisits);
    });

    it('handles rejected state', () => {
      const actual = shipVisitsReducer(
        initialState,
        fetchShipVisits.rejected(
          new Error('Failed to fetch'),
          'requestId',
          undefined
        )
      );
      expect(actual.loading).toBe(false);
      expect(actual.error).toBe('Failed to fetch');
    });
  });
});
```

### Testing Async Thunks

**src/features/shipVisits/shipVisitsSlice.test.ts (continued):**
```typescript
import { vi } from 'vitest';
import { axiosInstance } from '@/api/axios.config';

// Mock axios
vi.mock('@/api/axios.config', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('fetchShipVisits thunk', () => {
  it('fetches ship visits successfully', async () => {
    const mockData = [{ id: '1', shipName: 'Ship 1' }];
    vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

    const dispatch = vi.fn();
    const thunk = fetchShipVisits();
    
    await thunk(dispatch, () => ({}), undefined);
    
    const { calls } = dispatch.mock;
    expect(calls[0][0].type).toBe('shipVisits/fetchShipVisits/pending');
    expect(calls[1][0].type).toBe('shipVisits/fetchShipVisits/fulfilled');
    expect(calls[1][0].payload).toEqual(mockData);
  });

  it('handles fetch error', async () => {
    vi.mocked(axiosInstance.get).mockRejectedValue(
      new Error('Network error')
    );

    const dispatch = vi.fn();
    const thunk = fetchShipVisits();
    
    await thunk(dispatch, () => ({}), undefined);
    
    const { calls } = dispatch.mock;
    expect(calls[1][0].type).toBe('shipVisits/fetchShipVisits/rejected');
  });
});
```

---

## 🔗 Integration Testing

### Testing Feature Workflows

**src/features/shipVisits/ShipVisitsList.integration.test.tsx:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { axiosInstance } from '@/api/axios.config';
import ShipVisitsList from './ShipVisitsList';
import shipVisitsReducer from './shipVisitsSlice';

vi.mock('@/api/axios.config');

describe('ShipVisitsList Integration', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { shipVisits: shipVisitsReducer },
    });
  });

  it('loads and displays ship visits', async () => {
    const mockShipVisits = [
      { id: '1', shipName: 'MSC Oscar', imoNumber: '9793320', status: 'ARRIVED' },
      { id: '2', shipName: 'Ever Given', imoNumber: '9811000', status: 'SCHEDULED' },
    ];

    vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockShipVisits });

    render(
      <Provider store={store}>
        <ShipVisitsList />
      </Provider>
    );

    // Initially loading
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('MSC Oscar')).toBeInTheDocument();
      expect(screen.getByText('Ever Given')).toBeInTheDocument();
    });
  });

  it('handles filter and search', async () => {
    const user = userEvent.setup();
    
    // ... render component with mock data ...

    // Search by ship name
    const searchInput = screen.getByLabelText(/search/i);
    await user.type(searchInput, 'MSC');

    await waitFor(() => {
      expect(screen.getByText('MSC Oscar')).toBeInTheDocument();
      expect(screen.queryByText('Ever Given')).not.toBeInTheDocument();
    });
  });
});
```

---

## 🌐 E2E Testing Strategy

**Note:** E2E tests not implemented yet. Strategy outlined below.

### Recommended Tools

- **Playwright** or **Cypress** for E2E testing
- **Testing Library** for accessibility checks

### Critical User Journeys

**1. Login → View Dashboard:**
```typescript
// Example (Playwright)
test('User can login and view dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="username"]', 'admin');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button:text("Login")');
  
  await expect(page).toHaveURL('http://localhost:5173/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
  await expect(page.locator('[data-testid="kpi-total-ships"]')).toBeVisible();
});
```

**2. Create Ship Visit:**
```typescript
test('User can create ship visit', async ({ page }) => {
  // ... login first ...
  
  await page.click('text=Ship Visits');
  await page.click('button:text("Create Ship Visit")');
  
  await page.fill('[name="shipName"]', 'Test Ship');
  await page.fill('[name="imoNumber"]', '1234567');
  await page.selectOption('[name="visitType"]', 'CONTAINER');
  // ... fill other fields ...
  
  await page.click('button:text("Create")');
  
  await expect(page.locator('text=Test Ship')).toBeVisible();
});
```

---

## 📊 Coverage Goals

### Target Coverage

- **Overall**: >60%
- **Critical Paths**: >80% (auth, ship visits, tasks)
- **Utilities**: >90%
- **Components**: >70%

### Generate Coverage Report

```bash
npm run test:coverage
```

**View HTML Report:**
Open `coverage/index.html` in browser

---

## ✅ Best Practices

### Test Structure (AAA Pattern)

```typescript
it('descriptive test name', () => {
  // Arrange: Set up test data
  const input = 'test value';
  
  // Act: Perform action
  const result = myFunction(input);
  
  // Assert: Verify result
  expect(result).toBe('expected value');
});
```

### Descriptive Test Names

```typescript
// ✅ GOOD
it('returns formatted date when valid date provided', () => { });
it('displays error message when username is empty', () => { });

// ❌ BAD
it('works', () => { });
it('test 1', () => { });
```

### Test One Thing

```typescript
// ✅ GOOD: Each test checks one behavior
it('validates username is required', () => { });
it('validates password is required', () => { });

// ❌ BAD: Testing multiple things
it('validates form', () => {
  // checks username, password, email, etc.
});
```

### Use Test IDs for Complex Selectors

```tsx
// Component
<div data-testid="ship-visit-card">
  <h3>{shipName}</h3>
</div>

// Test
screen.getByTestId('ship-visit-card');
```

### Mock External Dependencies

```typescript
// Mock API calls
vi.mock('@/api/axios.config');

// Mock WebSocket
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  })),
}));
```

---

**Testing Guide - Version 1.0**

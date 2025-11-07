# Phase 5.11.5: Performance Optimization Plan

**Date:** November 3, 2025  
**Status:** 🚀 PLANNING  
**Dependencies:** Phase 5.11.4 Complete (Settings & Profile pages)

---

## 🎯 Objectives

Optimize frontend performance for production readiness:
1. Implement code splitting and lazy loading
2. Add React.memo and useMemo optimizations
3. Optimize bundle size and asset loading
4. Implement virtualization for large lists
5. Add service worker for offline capabilities
6. Optimize API calls with caching strategies

---

## 📋 Tasks Breakdown

### Task 1: Code Splitting & Lazy Loading (30 min)

**Goal:** Reduce initial bundle size by lazy loading route components

**Implementation:**
1. Convert all route imports to `React.lazy()`
2. Add `<Suspense>` boundaries with loading fallbacks
3. Create loading skeleton components
4. Implement error boundaries for lazy-loaded components

**Files to Modify:**
- `frontend/src/App.tsx` - Add lazy imports for all routes
- `frontend/src/components/common/PageLoader.tsx` - NEW (create loading skeleton)
- `frontend/src/components/common/ErrorBoundary.tsx` - Enhance for lazy loading errors

**Expected Results:**
- Initial bundle size reduced by ~40-50%
- Faster first contentful paint (FCP)
- Routes load on-demand

---

### Task 2: Component Memoization (45 min)

**Goal:** Prevent unnecessary re-renders using React optimization hooks

**Implementation:**
1. Wrap expensive components with `React.memo()`
2. Use `useMemo()` for computed values
3. Use `useCallback()` for stable function references
4. Identify and fix re-render hotspots

**Components to Optimize:**
- `ShipVisitListItem.tsx` - Memo wrapper + useCallback for handlers
- `ShipVisitTable.tsx` - useMemo for filtered/sorted data
- `KPICard.tsx` - React.memo (static unless data changes)
- `DashboardStats.tsx` - useMemo for calculations
- `TaskCard.tsx` - React.memo wrapper
- `DateRangePicker.tsx` - useCallback for date handlers
- Chart components - useMemo for chart data transformations

**Files to Modify:**
- All dashboard chart components
- List/table item components
- Form components with validation

**Tools:**
- React DevTools Profiler to identify slow components
- Why-did-you-render (optional dev dependency)

---

### Task 3: List Virtualization (30 min)

**Goal:** Efficiently render large lists (100+ items)

**Implementation:**
1. Install `react-window` or `react-virtualized`
2. Implement virtual scrolling for:
   - Ship Visits List
   - Event Logs List
   - Tasks List
   - Asset List

**Files to Create:**
- `frontend/src/components/common/VirtualList.tsx` - Reusable virtual list wrapper

**Files to Modify:**
- `ShipVisitList.tsx` - Use VirtualList for ship visits
- `EventLogsList.tsx` - Virtual scrolling for logs
- `TaskList.tsx` - Virtual scrolling for tasks

**Expected Results:**
- Handle 1000+ items without performance degradation
- Smooth scrolling on low-end devices
- Reduced memory footprint

---

### Task 4: Bundle Size Optimization (30 min)

**Goal:** Reduce production bundle size

**Implementation:**
1. Analyze bundle with `vite-plugin-visualizer`
2. Replace heavy dependencies:
   - Consider `dayjs` instead of `date-fns` (smaller)
   - Tree-shake MUI imports (already done, verify)
   - Remove unused dependencies
3. Configure Vite for optimal production builds
4. Enable gzip/brotli compression

**Files to Modify:**
- `vite.config.ts` - Add build optimizations
- `package.json` - Remove unused dependencies

**Configuration Changes:**
```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

### Task 5: Image & Asset Optimization (20 min)

**Goal:** Optimize static assets for faster loading

**Implementation:**
1. Add image optimization to build process
2. Convert images to WebP format (where supported)
3. Implement lazy loading for images
4. Add placeholder/blur effects for loading images

**Files to Create:**
- `frontend/src/components/common/OptimizedImage.tsx` - Image component with lazy loading

**Vite Plugins to Add:**
```bash
npm install -D vite-plugin-imagemin
```

---

### Task 6: API Request Optimization (45 min)

**Goal:** Reduce API calls and improve caching

**Implementation:**
1. Implement request deduplication
2. Add caching strategies:
   - Cache KPI data (5 min TTL)
   - Cache user data (session storage)
   - Cache static data (localStorage)
3. Implement stale-while-revalidate pattern
4. Add request throttling/debouncing for search/filters

**Files to Modify:**
- `frontend/src/api/axios.config.ts` - Add request cache layer
- All API files - Add cache configurations
- Redux slices - Implement cache invalidation

**New Utilities:**
```ts
// frontend/src/utils/requestCache.ts
export class RequestCache {
  // Simple in-memory cache with TTL
}
```

**Libraries to Consider:**
- `axios-cache-interceptor` (optional)
- Or custom implementation with `Map` + TTL

---

### Task 7: Redux Performance (30 min)

**Goal:** Optimize Redux state updates and selectors

**Implementation:**
1. Use `createSelector` from Reselect for memoized selectors
2. Normalize state shape (avoid nested objects)
3. Split large slices into smaller ones
4. Use `extraReducers` builder notation (already done, verify)

**Files to Modify:**
- All Redux slice files - Add memoized selectors
- `frontend/src/store/index.ts` - Verify configuration

**Example:**
```ts
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredShipVisits = createSelector(
  [selectShipVisits, selectFilters],
  (shipVisits, filters) => {
    // Expensive filtering logic memoized
    return shipVisits.filter(/* ... */);
  }
);
```

---

### Task 8: Service Worker & PWA (45 min)

**Goal:** Add offline capabilities and PWA features

**Implementation:**
1. Install `vite-plugin-pwa`
2. Configure service worker for offline caching
3. Add manifest.json for PWA
4. Cache static assets and API responses
5. Add install prompt for mobile users

**Files to Create:**
- `frontend/public/manifest.json` - PWA manifest
- `frontend/src/registerServiceWorker.ts` - SW registration logic

**Vite Configuration:**
```ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.portlink\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

### Task 9: Performance Monitoring (30 min)

**Goal:** Add performance tracking and monitoring

**Implementation:**
1. Implement Web Vitals tracking
2. Add custom performance marks
3. Monitor component render times
4. Track API response times
5. Send metrics to analytics (optional)

**Files to Create:**
- `frontend/src/utils/performance.ts` - Performance utilities
- `frontend/src/hooks/usePerformanceMonitor.ts` - Custom hook

**Implementation:**
```ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

---

### Task 10: Development Tools (20 min)

**Goal:** Add performance analysis tools for development

**Implementation:**
1. Add bundle analyzer
2. Add React DevTools profiler presets
3. Create performance testing scripts
4. Document performance best practices

**Files to Create:**
- `frontend/scripts/analyze-bundle.js` - Bundle analysis script
- `frontend/PERFORMANCE.md` - Performance guidelines

**Package Scripts:**
```json
{
  "scripts": {
    "analyze": "vite-bundle-visualizer",
    "build:analyze": "vite build && npm run analyze"
  }
}
```

---

## 📦 Dependencies to Install

```bash
# Core performance libraries
npm install react-window

# PWA support
npm install -D vite-plugin-pwa

# Bundle analysis
npm install -D vite-plugin-visualizer

# Web Vitals
npm install web-vitals

# Optional: Image optimization
npm install -D vite-plugin-imagemin

# Optional: Better caching
npm install axios-cache-interceptor
```

---

## 🎯 Success Metrics

### Performance Targets
- **Lighthouse Score:** > 90 (Performance)
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Bundle Size Targets
- **Initial JS Bundle:** < 250KB (gzipped)
- **Total JS Bundle:** < 800KB (all chunks, gzipped)
- **Total CSS:** < 50KB (gzipped)
- **Vendor Chunks:** Split by library

### Runtime Performance
- **List Rendering:** 60 FPS with 1000+ items
- **Component Re-renders:** < 3 per state change
- **API Response Caching:** 80% cache hit rate
- **Memory Usage:** < 100MB for typical session

---

## 🧪 Testing Strategy

### Performance Testing
1. **Lighthouse Audits** - Before/after comparison
2. **React Profiler** - Identify slow components
3. **Network Tab** - Analyze request waterfall
4. **Memory Profiler** - Check for memory leaks
5. **Coverage** - Ensure optimizations don't break features

### Load Testing
1. Test with 1000+ ship visits
2. Test with 500+ event logs
3. Test rapid navigation between routes
4. Test on throttled network (3G)
5. Test on low-end devices (CPU throttling)

---

## 📊 Implementation Order

**Priority 1 (High Impact, Low Effort):**
1. ✅ Code splitting & lazy loading
2. ✅ Component memoization
3. ✅ API request caching

**Priority 2 (High Impact, Medium Effort):**
4. ✅ List virtualization
5. ✅ Bundle size optimization
6. ✅ Redux selectors optimization

**Priority 3 (Medium Impact, Medium Effort):**
7. ✅ Image optimization
8. ✅ Service worker & PWA
9. ✅ Performance monitoring

**Priority 4 (Nice to Have):**
10. ✅ Development tools & documentation

---

## 🚀 Expected Outcomes

After Phase 5.11.5 completion:
- ✅ **40-50% smaller initial bundle**
- ✅ **2x faster page loads**
- ✅ **Smooth 60 FPS rendering** (even with 1000+ items)
- ✅ **Offline capabilities** (PWA)
- ✅ **80% reduction in unnecessary re-renders**
- ✅ **Better Core Web Vitals scores**
- ✅ **Production-ready performance**

---

## 📝 Deliverables

1. **Optimized Components** - All components memoized where appropriate
2. **Virtual Lists** - Ship Visits, Event Logs, Tasks virtualized
3. **Code Splitting** - Route-based lazy loading implemented
4. **PWA Configuration** - Service worker + manifest.json
5. **Performance Documentation** - PERFORMANCE.md with guidelines
6. **Bundle Analysis Report** - Visual breakdown of bundle composition
7. **Lighthouse Report** - Before/after comparison
8. **Performance Monitoring** - Web Vitals tracking in production

---

## ⚠️ Potential Challenges

1. **React.memo Over-optimization** - Don't memo everything, profile first
2. **Virtual List Complexity** - May need custom implementations for complex items
3. **Service Worker Caching** - Cache invalidation can be tricky
4. **Bundle Splitting** - Too many chunks can hurt performance
5. **Lazy Loading UX** - Need good loading states to avoid jarring transitions

---

## 🔄 Next Phase

After Phase 5.11.5, proceed to:
- **Phase 5.11.6:** Accessibility Improvements (WCAG 2.1 AA compliance)
- **Phase 5.12:** Final Polish & Bug Fixes
- **Phase 6:** Integration Testing & Deployment

---

**Estimated Duration:** 4-5 hours  
**Complexity:** Medium-High  
**Impact:** High (Production performance)

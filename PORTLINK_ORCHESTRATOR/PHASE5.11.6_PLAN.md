# Phase 5.11.6: Accessibility Improvements Plan

**Date:** November 3, 2025  
**Status:** 🚀 STARTING  
**Dependencies:** Phase 5.11.5 Complete (Performance Optimization)  
**Target:** WCAG 2.1 AA Compliance

---

## 🎯 Objectives

Make the PortLink application accessible to all users:
1. Keyboard navigation support
2. Screen reader compatibility
3. ARIA labels and landmarks
4. Focus management
5. Color contrast compliance
6. Skip navigation links
7. Accessible forms and error messages
8. Responsive touch targets

---

## 📋 Tasks Breakdown

### Task 1: Semantic HTML & ARIA Landmarks (30 min)

**Goal:** Improve document structure for screen readers

**Implementation:**
1. Add ARIA landmarks to MainLayout
2. Use semantic HTML5 elements
3. Add skip navigation link
4. Proper heading hierarchy

**Files to Modify:**
- `MainLayout.tsx` - Add <header>, <main>, <nav>, <aside> with ARIA
- `AppHeader.tsx` - Add skip link
- All page components - Verify heading hierarchy (h1 → h2 → h3)

**ARIA Landmarks:**
```tsx
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
  </nav>
</header>
<main role="main" id="main-content">
  {/* Page content */}
</main>
<footer role="contentinfo">
</footer>
```

**Skip Link:**
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

---

### Task 2: Keyboard Navigation (45 min)

**Goal:** Full keyboard accessibility (Tab, Enter, Escape, Arrow keys)

**Implementation:**
1. Focus management for modals/dialogs
2. Keyboard shortcuts for common actions
3. Focus trap in modals
4. Visible focus indicators
5. Tab order optimization

**Components to Update:**
- All dialogs/modals - Focus trap
- Forms - Tab order, Escape to cancel
- Tables - Arrow key navigation
- Dropdowns - Arrow keys + Enter
- Sidebar - Collapse/expand with keyboard

**Focus Management:**
```tsx
// Focus trap for dialogs
import { useEffect, useRef } from 'react';

const DialogComponent = ({ open, onClose }) => {
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (open) {
      firstFocusRef.current?.focus();
    }
  }, [open]);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  // Trap focus within dialog
};
```

**Keyboard Shortcuts:**
- `Ctrl+K` - Global search
- `Ctrl+S` - Save form
- `Escape` - Close modal/dialog
- `Tab/Shift+Tab` - Navigate elements
- `Enter/Space` - Activate buttons
- `Arrow keys` - Navigate lists/tables

---

### Task 3: Screen Reader Support (45 min)

**Goal:** Meaningful content for screen readers

**Implementation:**
1. Add ARIA labels to interactive elements
2. Descriptive button text (not just icons)
3. Form labels and error announcements
4. Live regions for dynamic content
5. Image alt text

**Files to Update:**
- All icon-only buttons - Add aria-label
- All forms - Connect labels with inputs
- All images - Add alt text
- Dashboard/KPI updates - Use aria-live regions
- Navigation - Add aria-current for active links

**Examples:**
```tsx
// Icon button with aria-label
<IconButton aria-label="Edit ship visit">
  <Edit />
</IconButton>

// Form field with proper label
<TextField
  id="ship-name"
  label="Ship Name"
  aria-required="true"
  aria-invalid={!!errors.shipName}
  aria-describedby={errors.shipName ? "ship-name-error" : undefined}
/>
{errors.shipName && (
  <FormHelperText id="ship-name-error" error>
    {errors.shipName.message}
  </FormHelperText>
)}

// Live region for updates
<div role="status" aria-live="polite" aria-atomic="true">
  {kpiUpdateMessage}
</div>

// Navigation with current page
<NavLink to="/dashboard" aria-current={isActive ? 'page' : undefined}>
  Dashboard
</NavLink>
```

---

### Task 4: Color Contrast Compliance (30 min)

**Goal:** Meet WCAG AA contrast ratio requirements (4.5:1 for text)

**Implementation:**
1. Audit current color palette
2. Adjust low-contrast colors
3. Add focus indicators with sufficient contrast
4. Test status colors (error, warning, success)

**Files to Modify:**
- `theme/colors.ts` - Adjust colors if needed
- `theme/theme.ts` - Ensure proper contrast
- All status chips/badges - Verify contrast

**Contrast Checker:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Tools:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- axe DevTools browser extension

---

### Task 5: Form Accessibility (45 min)

**Goal:** Accessible form controls and validation

**Implementation:**
1. Connect labels to inputs
2. Group related fields with fieldset
3. Error messages with aria-describedby
4. Required field indicators
5. Autocomplete attributes

**Files to Update:**
- `LoginForm.tsx`
- `ShipVisitForm.tsx`
- All form components

**Pattern:**
```tsx
<FormControl error={!!errors.email} required>
  <InputLabel htmlFor="email">Email Address</InputLabel>
  <TextField
    id="email"
    name="email"
    type="email"
    autoComplete="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : "email-helper"}
    inputRef={register}
  />
  <FormHelperText id="email-helper">
    Your work email address
  </FormHelperText>
  {errors.email && (
    <FormHelperText id="email-error" error role="alert">
      {errors.email.message}
    </FormHelperText>
  )}
</FormControl>
```

---

### Task 6: Focus Indicators (20 min)

**Goal:** Visible focus states for keyboard navigation

**Implementation:**
1. Custom focus styles in theme
2. Ensure all interactive elements have focus state
3. Skip outline removal (accessibility anti-pattern)

**Files to Modify:**
- `theme/theme.ts` - Global focus styles

**CSS:**
```tsx
// In theme.ts
MuiButton: {
  styleOverrides: {
    root: {
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: '2px',
      },
    },
  },
},
// Apply to all focusable components
```

---

### Task 7: Touch Target Size (20 min)

**Goal:** Minimum 44x44px touch targets (WCAG 2.1 AA)

**Implementation:**
1. Audit small buttons/icons
2. Increase touch target size
3. Add adequate spacing

**Files to Update:**
- Icon buttons - Ensure minimum size
- Table action buttons - Increase padding
- Mobile navigation - Larger tap areas

**Fix:**
```tsx
// Before
<IconButton size="small">
  <Edit />
</IconButton>

// After (minimum 44x44px)
<IconButton 
  size="medium"
  sx={{ minWidth: 44, minHeight: 44 }}
>
  <Edit />
</IconButton>
```

---

### Task 8: Create Accessibility Utils (30 min)

**Goal:** Reusable accessibility helpers

**Files to Create:**
- `frontend/src/utils/a11y.ts` - Accessibility utilities
- `frontend/src/hooks/useKeyboardShortcut.ts` - Keyboard shortcut hook
- `frontend/src/hooks/useFocusTrap.ts` - Focus trap hook
- `frontend/src/hooks/useAnnouncement.ts` - Screen reader announcements

**Utilities:**
```tsx
// frontend/src/utils/a11y.ts
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const skipLink = {
  position: 'absolute',
  top: '-40px',
  left: 0,
  background: 'primary.main',
  color: 'white',
  padding: '8px',
  textDecoration: 'none',
  '&:focus': {
    top: 0,
  },
};

// ID generator for aria-describedby
export const generateId = (prefix: string) => 
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
```

**Hooks:**
```tsx
// useKeyboardShortcut.ts
export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  ctrlKey = false
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && (!ctrlKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, ctrlKey]);
};

// useFocusTrap.ts
export const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => element.removeEventListener('keydown', handleTabKey);
  }, [ref]);
};
```

---

### Task 9: Add ARIA Live Regions (30 min)

**Goal:** Announce dynamic content updates to screen readers

**Files to Create:**
- `frontend/src/components/common/LiveRegion.tsx`
- `frontend/src/components/common/Announcement.tsx`

**Implementation:**
```tsx
// LiveRegion.tsx
interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export const LiveRegion = ({ message, politeness = 'polite' }: LiveRegionProps) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic="true"
    style={visuallyHidden}
  >
    {message}
  </div>
);
```

**Usage:**
```tsx
// In Dashboard when KPIs update
const [announcement, setAnnouncement] = useState('');

useEffect(() => {
  if (kpiData) {
    setAnnouncement(`KPIs updated. ${kpiData.ships.total} ships in port.`);
  }
}, [kpiData]);

return (
  <>
    <LiveRegion message={announcement} />
    {/* Dashboard content */}
  </>
);
```

---

### Task 10: Documentation & Testing (30 min)

**Goal:** Document accessibility features and testing process

**Files to Create:**
- `frontend/ACCESSIBILITY.md` - Accessibility guide
- `frontend/docs/keyboard-shortcuts.md` - Keyboard shortcuts reference

**Testing Checklist:**
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible
- [ ] Forms have proper labels and error messages
- [ ] Touch targets >= 44x44px
- [ ] Headings follow proper hierarchy
- [ ] Skip link works
- [ ] ARIA landmarks present
- [ ] No accessibility warnings in Lighthouse

**Tools:**
- Lighthouse accessibility audit
- axe DevTools browser extension
- NVDA/JAWS screen reader testing
- Keyboard-only navigation testing

---

## 🎯 Success Criteria

### WCAG 2.1 AA Requirements
- ✅ Keyboard accessible
- ✅ Screen reader compatible
- ✅ Color contrast 4.5:1 (text)
- ✅ Focus indicators visible
- ✅ Forms properly labeled
- ✅ Touch targets 44x44px
- ✅ Skip navigation available
- ✅ Proper heading hierarchy

### Performance Targets
- **Lighthouse Accessibility Score:** > 95
- **axe DevTools:** 0 critical issues
- **Keyboard Navigation:** All features accessible
- **Screen Reader:** Complete navigation without mouse

---

## 📊 Implementation Priority

**Priority 1 (Critical):**
1. ✅ Keyboard navigation
2. ✅ ARIA labels for icon buttons
3. ✅ Form accessibility
4. ✅ Focus indicators

**Priority 2 (Important):**
5. ✅ Semantic HTML & landmarks
6. ✅ Screen reader support
7. ✅ Color contrast audit
8. ✅ Touch target size

**Priority 3 (Nice to Have):**
9. ✅ Live regions
10. ✅ Documentation

---

## 🚀 Expected Outcomes

After Phase 5.11.6:
- ✅ **WCAG 2.1 AA compliant**
- ✅ **Lighthouse Accessibility > 95**
- ✅ **Full keyboard navigation**
- ✅ **Screen reader compatible**
- ✅ **Better UX for all users**
- ✅ **Legal compliance ready**

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't remove focus outlines** (`outline: none` without alternative)
2. **Don't use `div` for buttons** (use semantic `<button>`)
3. **Don't forget alt text** for images
4. **Don't rely on color alone** for information
5. **Don't use placeholder as label**
6. **Don't trap focus accidentally**
7. **Don't forget mobile touch targets**

---

**Estimated Duration:** 4-5 hours  
**Complexity:** Medium  
**Impact:** High (Legal compliance, better UX)

/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Visually hidden styles - hide element visually but keep it accessible to screen readers
 * Use for skip links, sr-only labels, etc.
 */
export const visuallyHidden = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
};

/**
 * Skip link styles - accessible navigation skip link
 */
export const skipLink = {
  position: 'absolute' as const,
  top: '-40px',
  left: 0,
  zIndex: 9999,
  backgroundColor: 'primary.main',
  color: 'white',
  padding: 1.5,
  textDecoration: 'none',
  fontWeight: 600,
  '&:focus': {
    top: 0,
  },
};

/**
 * Generate unique ID for ARIA attributes
 * @param prefix - Prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if color contrast meets WCAG AA standards
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns True if contrast ratio >= 4.5:1
 */
export const meetsContrastRequirement = (
  foreground: string,
  background: string
): boolean => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      const sRGB = c / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return ratio >= 4.5;
};

/**
 * Get ARIA live region props
 * @param politeness - 'polite' | 'assertive'
 * @returns ARIA props object
 */
export const liveRegionProps = (politeness: 'polite' | 'assertive' = 'polite') => ({
  role: 'status' as const,
  'aria-live': politeness,
  'aria-atomic': true,
});

/**
 * Get accessible error message props
 * @param id - Unique ID for the error message
 * @returns ARIA props object
 */
export const errorMessageProps = (id: string) => ({
  id,
  role: 'alert' as const,
  'aria-live': 'assertive' as const,
});

/**
 * Get accessible form field props
 * @param label - Field label
 * @param required - Is field required
 * @param error - Error message
 * @param helpText - Helper text
 * @returns ARIA props object
 */
export const formFieldProps = (
  label: string,
  required = false,
  error?: string,
  helpText?: string
) => {
  const fieldId = generateId('field');
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [helpId, errorId].filter(Boolean).join(' ');

  return {
    id: fieldId,
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': describedBy || undefined,
    helpId,
    errorId,
  };
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNav = {
  /**
   * Check if Enter or Space key pressed (for button activation)
   */
  isActivationKey: (event: React.KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  /**
   * Check if Escape key pressed (for dialog closing)
   */
  isEscapeKey: (event: React.KeyboardEvent | KeyboardEvent): boolean => {
    return event.key === 'Escape' || event.key === 'Esc';
  },

  /**
   * Check if Tab key pressed
   */
  isTabKey: (event: React.KeyboardEvent | KeyboardEvent): boolean => {
    return event.key === 'Tab';
  },

  /**
   * Check if arrow key pressed
   */
  isArrowKey: (event: React.KeyboardEvent | KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },
};

/**
 * Focus management helpers
 */
export const focusManagement = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector));
  },

  /**
   * Set focus to first focusable element
   */
  focusFirst: (container: HTMLElement): void => {
    const elements = focusManagement.getFocusableElements(container);
    elements[0]?.focus();
  },

  /**
   * Set focus to last focusable element
   */
  focusLast: (container: HTMLElement): void => {
    const elements = focusManagement.getFocusableElements(container);
    elements[elements.length - 1]?.focus();
  },
};

/**
 * Screen reader only text component props
 */
export const srOnly = visuallyHidden;

/**
 * Announce to screen readers
 * @param message - Message to announce
 * @param politeness - 'polite' | 'assertive'
 */
export const announce = (
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  Object.assign(announcement.style, visuallyHidden);
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

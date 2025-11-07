import { useEffect } from 'react';
import type { RefObject } from 'react';
import { focusManagement } from '@/utils/a11y';

/**
 * Focus trap hook - traps focus within a container (for modals, dialogs)
 * @param ref - Ref to the container element
 * @param active - Whether the trap is active
 */
export const useFocusTrap = (
  ref: RefObject<HTMLElement>,
  active = true
): void => {
  useEffect(() => {
    if (!active) return;

    const element = ref.current;
    if (!element) return;

    const focusableElements = focusManagement.getFocusableElements(element);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref, active]);
};

export default useFocusTrap;

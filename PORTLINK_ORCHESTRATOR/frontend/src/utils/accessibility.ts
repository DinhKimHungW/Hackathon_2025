import { createElement, type CSSProperties, type FC, type FocusEvent, type ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
}

/**
 * VisuallyHidden component for screen readers only
 * Content is hidden visually but accessible to screen readers
 */
export const VisuallyHidden: FC<VisuallyHiddenProps> = ({ children }) =>
  createElement(
    'span',
    {
      style: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      } as CSSProperties,
    },
    children,
  );

const skipLinkStyle: CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  zIndex: 999,
  padding: '1em',
  backgroundColor: '#000',
  color: '#fff',
  textDecoration: 'none',
};

const handleSkipLinkFocus = (event: FocusEvent<HTMLAnchorElement>) => {
  event.currentTarget.style.left = '0';
};

const handleSkipLinkBlur = (event: FocusEvent<HTMLAnchorElement>) => {
  event.currentTarget.style.left = '-9999px';
};

/**
 * Skip to main content link for keyboard navigation
 */
export const SkipToContent: FC = () =>
  createElement(
    'a',
    {
      href: '#main-content',
      style: skipLinkStyle,
      onFocus: handleSkipLinkFocus,
      onBlur: handleSkipLinkBlur,
    },
    'Skip to main content',
  );

/**
 * Generate accessible ARIA label for buttons
 */
export const getAriaLabel = (action: string, item?: string): string => (item ? `${action} ${item}` : action);

/**
 * Generate accessible ID for form fields
 */
export const getFieldId = (name: string): string => `field-${name}`;

/**
 * Generate accessible describedby ID
 */
export const getDescribedById = (name: string): string => `${name}-description`;

/**
 * Generate accessible error ID
 */
export const getErrorId = (name: string): string => `${name}-error`;

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-9999px';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  window.setTimeout(() => {
    document.body.removeChild(announcement);
  }, 3000);
};

export default {
  VisuallyHidden,
  SkipToContent,
  getAriaLabel,
  getFieldId,
  getDescribedById,
  getErrorId,
  announceToScreenReader,
};

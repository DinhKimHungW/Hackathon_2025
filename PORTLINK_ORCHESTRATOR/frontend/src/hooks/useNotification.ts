import { useSnackbar } from 'notistack';
import type { VariantType, OptionsObject } from 'notistack';
import { useCallback } from 'react';

/**
 * Notification options
 */
interface NotificationOptions extends Omit<OptionsObject, 'variant'> {
  /**
   * Duration in milliseconds (default: 5000)
   */
  duration?: number;
  /**
   * Position of the notification
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * useNotification Hook
 * 
 * Simplified interface for showing toast notifications
 * 
 * @example
 * ```tsx
 * const { success, error, warning, info } = useNotification();
 * 
 * // Show success notification
 * success('Ship visit created successfully!');
 * 
 * // Show error notification
 * error('Failed to save ship visit', { duration: 7000 });
 * 
 * // Show warning
 * warning('This action cannot be undone');
 * 
 * // Show info
 * info('New ship visits available', { position: 'top-right' });
 * ```
 */
export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  /**
   * Show a notification with the specified variant
   */
  const showNotification = useCallback(
    (message: string, variant: VariantType, options?: NotificationOptions) => {
      const { duration = 5000, position, ...otherOptions } = options || {};

      return enqueueSnackbar(message, {
        variant,
        autoHideDuration: duration,
        anchorOrigin: position
          ? {
              vertical: position.startsWith('top') ? 'top' : 'bottom',
              horizontal: position.endsWith('left')
                ? 'left'
                : position.endsWith('right')
                ? 'right'
                : 'center',
            }
          : {
              vertical: 'bottom',
              horizontal: 'right',
            },
        ...otherOptions,
      });
    },
    [enqueueSnackbar]
  );

  /**
   * Show success notification
   */
  const success = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'success', options);
    },
    [showNotification]
  );

  /**
   * Show error notification
   */
  const error = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'error', {
        duration: 7000, // Errors stay longer
        ...options,
      });
    },
    [showNotification]
  );

  /**
   * Show warning notification
   */
  const warning = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'warning', options);
    },
    [showNotification]
  );

  /**
   * Show info notification
   */
  const info = useCallback(
    (message: string, options?: NotificationOptions) => {
      return showNotification(message, 'info', options);
    },
    [showNotification]
  );

  /**
   * Close a specific notification or all notifications
   */
  const close = useCallback(
    (key?: string | number) => {
      closeSnackbar(key);
    },
    [closeSnackbar]
  );

  return {
    success,
    error,
    warning,
    info,
    close,
  };
};

export default useNotification;

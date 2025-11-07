import { useState, useCallback } from 'react';
import { announce as announceToScreenReader } from '@/utils/a11y';

interface UseAnnouncementReturn {
  announcement: string;
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  clear: () => void;
}

/**
 * Hook for screen reader announcements
 * @returns announcement state and functions
 * 
 * @example
 * const { announcement, announce } = useAnnouncement();
 * 
 * // Announce success message
 * announce('Ship visit created successfully');
 * 
 * // Announce urgent message
 * announce('Error: Failed to save', 'assertive');
 */
export const useAnnouncement = (): UseAnnouncementReturn => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      setAnnouncement(message);
      announceToScreenReader(message, politeness);

      // Clear announcement after 1 second
      setTimeout(() => {
        setAnnouncement('');
      }, 1000);
    },
    []
  );

  const clear = useCallback(() => {
    setAnnouncement('');
  }, []);

  return {
    announcement,
    announce,
    clear,
  };
};

export default useAnnouncement;

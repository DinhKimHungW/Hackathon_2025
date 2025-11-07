import { Box } from '@mui/material';
import { visuallyHidden } from '@/utils/a11y';

interface LiveRegionProps {
  /**
   * Message to announce to screen readers
   */
  message: string;
  /**
   * Politeness level for announcements
   * - 'polite': Wait for user to finish current activity (default)
   * - 'assertive': Interrupt user immediately (use sparingly)
   */
  politeness?: 'polite' | 'assertive';
  /**
   * Whether to read the entire region when it changes (default: true)
   */
  atomic?: boolean;
}

/**
 * Live region for screen reader announcements
 * Invisible to sighted users but announces changes to screen readers
 * 
 * @example
 * // Polite announcement (default)
 * <LiveRegion message="3 new ship visits arrived" />
 * 
 * // Assertive announcement for errors
 * <LiveRegion message="Error: Failed to save" politeness="assertive" />
 */
export function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
}: LiveRegionProps) {
  if (!message) return null;

  return (
    <Box
      component="div"
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      sx={visuallyHidden}
    >
      {message}
    </Box>
  );
}

export default LiveRegion;

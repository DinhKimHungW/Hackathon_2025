import React, { useEffect, useState } from 'react';
import { Alert, Collapse, IconButton } from '@mui/material';
import { Close, WifiOff } from '@mui/icons-material';

/**
 * OfflineBanner Component
 * 
 * Displays a banner when the user loses internet connectivity.
 * Automatically shows when offline and hides when back online.
 * 
 * @example
 * ```tsx
 * <OfflineBanner />
 * ```
 */
const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Update online status when network changes
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false); // Reset dismiss when back online
    };

    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false); // Show banner when going offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Show banner when offline and not dismissed
  const showBanner = !isOnline && !dismissed;

  return (
    <Collapse in={showBanner}>
      <Alert
        severity="warning"
        icon={<WifiOff />}
        action={
          <IconButton
            aria-label="Close offline banner"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1,
        }}
      >
        You are currently offline. Some features may not be available.
      </Alert>
    </Collapse>
  );
};

export default OfflineBanner;

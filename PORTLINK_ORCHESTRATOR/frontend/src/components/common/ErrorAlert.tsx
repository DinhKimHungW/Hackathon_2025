import React from 'react';
import { Alert, AlertTitle, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ErrorAlertProps {
  error: string | Error | null;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
  onClose?: () => void;
  open?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title,
  severity = 'error',
  onClose,
  open = true,
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        action={
          onClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
        sx={{ mb: 2 }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {errorMessage}
      </Alert>
    </Collapse>
  );
};

export default ErrorAlert;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Slide,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreenOnMobile?: boolean;
}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullScreenOnMobile = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = fullScreenOnMobile && isMobile;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      TransitionComponent={fullScreen ? Transition : undefined}
      aria-labelledby="dialog-title"
    >
      <DialogTitle
        id="dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>{title}</Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{ ml: 1 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 1.5 },
            '& > *': {
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: 80 },
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ResponsiveDialog;

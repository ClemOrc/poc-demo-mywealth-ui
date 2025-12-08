import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
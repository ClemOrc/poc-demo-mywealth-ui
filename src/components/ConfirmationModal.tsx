import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { COLORS } from '../constants';

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${COLORS.BORDER_GRAY}`,
          pb: 2,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <DialogContentText sx={{ color: COLORS.TEXT_SECONDARY, fontSize: '0.95rem' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: `1px solid ${COLORS.BORDER_GRAY}`,
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3,
            borderColor: COLORS.BORDER_GRAY,
            color: COLORS.TEXT_SECONDARY,
            '&:hover': {
              borderColor: COLORS.TEXT_SECONDARY,
              backgroundColor: COLORS.BACKGROUND_GRAY,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 3,
            ...(confirmColor === 'error' && {
              backgroundColor: '#c62828',
              '&:hover': {
                backgroundColor: '#b71c1c',
              },
            }),
            ...(confirmColor === 'success' && {
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#1b5e20',
              },
            }),
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
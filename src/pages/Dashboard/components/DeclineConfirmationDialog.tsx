import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';

interface DeclineConfirmationDialogProps {
  open: boolean;
  agreementId: string;
  clientName: string;
  loading: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const DeclineConfirmationDialog: React.FC<DeclineConfirmationDialogProps> = ({
  open,
  agreementId,
  clientName,
  loading,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  // Reset reason when dialog opens
  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="decline-dialog-title"
      aria-describedby="decline-dialog-description"
    >
      <DialogTitle id="decline-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon sx={{ color: '#d32f2f' }} />
          <Typography variant="h6" component="span">
            Decline Agreement
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent id="decline-dialog-description">
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Agreement ID:</strong> {agreementId}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Client Name:</strong> {clientName}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              This agreement will be moved to <strong>EXPIRED</strong> status.
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Reason (optional)"
              multiline
              rows={3}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder="Enter reason for declining this agreement..."
              aria-label="Reason for declining"
              inputProps={{
                maxLength: 500,
              }}
              helperText={`${reason.length}/500 characters`}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          aria-label="Cancel decline"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          aria-label="Confirm decline"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          {loading ? 'Declining...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeclineConfirmationDialog;
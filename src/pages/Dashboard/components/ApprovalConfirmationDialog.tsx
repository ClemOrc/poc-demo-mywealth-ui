import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface ApprovalConfirmationDialogProps {
  open: boolean;
  agreementId: string;
  clientName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ApprovalConfirmationDialog: React.FC<ApprovalConfirmationDialogProps> = ({
  open,
  agreementId,
  clientName,
  loading,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
    >
      <DialogTitle id="approval-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: '#2e7d32' }} />
          <Typography variant="h6" component="span">
            Approve Agreement
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent id="approval-dialog-description">
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Agreement ID:</strong> {agreementId}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Client Name:</strong> {clientName}
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              This agreement will be moved to <strong>ACTIVE</strong> status.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          aria-label="Cancel approval"
          sx={{
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="success"
          aria-label="Confirm approval"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          {loading ? 'Approving...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalConfirmationDialog;
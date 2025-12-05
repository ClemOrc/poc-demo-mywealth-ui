import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Agreement } from '../../../types';

interface ApprovalConfirmationDialogProps {
  open: boolean;
  type: 'approve' | 'decline';
  agreement: Agreement | null;
  loading: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

/**
 * ApprovalConfirmationDialog Component
 * 
 * Displays a confirmation dialog for approve or decline actions.
 * For approve: shows success message and agreement details
 * For decline: shows warning message and optional reason field
 * 
 * Accessibility:
 * - Keyboard navigable (Tab, Enter, Escape)
 * - ARIA labels on all interactive elements
 * - Focus management on dialog open
 * - Loading states with disabled buttons
 */
const ApprovalConfirmationDialog: React.FC<ApprovalConfirmationDialogProps> = ({
  open,
  type,
  agreement,
  loading,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (type === 'decline') {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  const handleClose = () => {
    setReason('');
    onCancel();
  };

  if (!agreement) {
    return null;
  }

  const isApprove = type === 'approve';
  const title = isApprove ? 'Approve Agreement' : 'Decline Agreement';
  const statusMessage = isApprove 
    ? 'This agreement will be moved to ACTIVE status' 
    : 'This agreement will be moved to EXPIRED status';
  const confirmButtonText = isApprove ? 'Confirm Approval' : 'Confirm Decline';
  const confirmButtonColor = isApprove ? 'success' : 'error';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle 
        id="approval-dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 2,
        }}
      >
        {isApprove ? (
          <CheckCircleIcon color="success" />
        ) : (
          <WarningAmberIcon color="error" />
        )}
        <Typography variant="h6" component="span">
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Agreement ID:</strong> {agreement.agreementNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Client Name:</strong> {agreement.clientName}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 2, 
            bgcolor: isApprove ? 'success.light' : 'error.light',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography 
            id="approval-dialog-description"
            variant="body1"
            sx={{ color: isApprove ? 'success.dark' : 'error.dark' }}
          >
            {statusMessage}
          </Typography>
        </Box>

        {!isApprove && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            placeholder="Enter reason for declining this agreement..."
            aria-label="Decline reason"
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          aria-label="Cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmButtonColor}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          aria-label={confirmButtonText}
          sx={{
            minWidth: 160,
          }}
        >
          {loading ? 'Processing...' : confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalConfirmationDialog;
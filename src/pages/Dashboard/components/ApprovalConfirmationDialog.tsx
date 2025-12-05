import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export type ApprovalAction = 'approve' | 'decline';

interface ApprovalConfirmationDialogProps {
  open: boolean;
  action: ApprovalAction;
  agreementId: string;
  clientName: string;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
}

const ApprovalConfirmationDialog: React.FC<ApprovalConfirmationDialogProps> = ({
  open,
  action,
  agreementId,
  clientName,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === 'approve';

  const title = isApprove ? 'Approve Agreement' : 'Decline Agreement';
  const statusMessage = isApprove
    ? 'This agreement will be moved to ACTIVE status.'
    : 'This agreement will be moved to EXPIRED status.';
  const icon = isApprove ? (
    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'success.main' }} />
  ) : (
    <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main' }} />
  );

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm(action === 'decline' ? reason : undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
    >
      <DialogTitle id="approval-dialog-title" sx={{ pb: 1 }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          {icon}
          
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Agreement ID: {agreementId}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Client Name: {clientName}
            </Typography>
            <Typography
              id="approval-dialog-description"
              variant="body2"
              color="text.secondary"
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
              placeholder="Enter reason for declining this agreement..."
              value={reason}
              onChange={handleReasonChange}
              disabled={loading}
              sx={{ mt: 1 }}
              inputProps={{
                'aria-label': 'Reason for declining',
              }}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ textTransform: 'none' }}
          aria-label="Cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={isApprove ? 'primary' : 'error'}
          sx={{ textTransform: 'none', minWidth: 100 }}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          aria-label={`Confirm ${action}`}
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalConfirmationDialog;
import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Agreement, AgreementStatus } from '../../types';

interface ActionMenuProps {
  agreement: Agreement;
  onView?: (agreementId: string) => void;
  onApprove?: (agreementId: string) => void;
  onDecline?: (agreementId: string, reason: string) => void;
  onEdit?: (agreementId: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  agreement,
  onApprove,
  onDecline,
  onView,
  onEdit,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent row click
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApproveClick = () => {
    handleClose();
    setApproveDialogOpen(true);
  };

  const handleDeclineClick = () => {
    handleClose();
    setDeclineDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (onApprove) {
      onApprove(agreement.id);
    }
    setApproveDialogOpen(false);
  };

  const handleDeclineConfirm = () => {
    if (onDecline && declineReason.trim()) {
      onDecline(agreement.id, declineReason);
    }
    setDeclineDialogOpen(false);
    setDeclineReason('');
  };

  const handleViewClick = () => {
    handleClose();
    if (onView) {
      onView(agreement.id);
    }
  };

  const handleEditClick = () => {
    handleClose();
    if (onEdit) {
      onEdit(agreement.id);
    }
  };

  const isPendingApproval = agreement.status === AgreementStatus.PENDING_APPROVAL;
  const isDraft = agreement.status === AgreementStatus.DRAFT;

  return (
    <>
      <IconButton
        aria-label="more actions"
        id={`action-button-${agreement.id}`}
        aria-controls={open ? `action-menu-${agreement.id}` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        id={`action-menu-${agreement.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `action-button-${agreement.id}`,
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewClick}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {(isDraft || isPendingApproval) && onEdit && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}

        {isPendingApproval && onApprove && (
          <MenuItem onClick={handleApproveClick}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Approve</ListItemText>
          </MenuItem>
        )}

        {isPendingApproval && onDecline && (
          <MenuItem onClick={handleDeclineClick}>
            <ListItemIcon>
              <CancelIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Decline</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Approve Agreement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve agreement <strong>{agreement.agreementNumber}</strong> for{' '}
            <strong>{agreement.clientName}</strong>?
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <DialogContentText variant="body2" color="text.secondary">
              This action will activate the agreement and it will become effective immediately.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleApproveConfirm} variant="contained" color="success" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog
        open={declineDialogOpen}
        onClose={() => setDeclineDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Decline Agreement</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for declining agreement <strong>{agreement.agreementNumber}</strong> for{' '}
            <strong>{agreement.clientName}</strong>:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="decline-reason"
            label="Reason for Declining"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Please explain why this agreement is being declined..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeclineConfirm}
            variant="contained"
            color="error"
            disabled={!declineReason.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionMenu;
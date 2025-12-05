import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Agreement, AgreementStatus } from '../../../types';

interface AgreementActionsMenuProps {
  agreement: Agreement;
  onApprove: (agreement: Agreement) => void;
  onDecline: (agreement: Agreement) => void;
}

/**
 * AgreementActionsMenu Component
 * 
 * Displays a context menu with Approve/Decline options for agreements with PENDING_APPROVAL status.
 * Menu is hidden for other statuses.
 * 
 * Accessibility:
 * - Keyboard accessible via tab + enter/space
 * - ARIA labels for screen readers
 * - Focus management on menu open/close
 */
const AgreementActionsMenu: React.FC<AgreementActionsMenuProps> = ({
  agreement,
  onApprove,
  onDecline,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Only show menu for PENDING_APPROVAL status
  if (agreement.status !== AgreementStatus.PENDING_APPROVAL) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent row click
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent row click
    }
    setAnchorEl(null);
  };

  const handleApprove = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    handleClose();
    onApprove(agreement);
  };

  const handleDecline = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    handleClose();
    onDecline(agreement);
  };

  return (
    <>
      <IconButton
        aria-label="Agreement actions"
        aria-controls={open ? 'agreement-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        sx={{ 
          p: 0.5,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id="agreement-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        MenuListProps={{
          'aria-labelledby': 'agreement-actions-button',
          sx: { py: 0.5 }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={handleApprove}
          aria-label="Approve agreement"
          sx={{ 
            py: 1,
            px: 2,
            minWidth: 180,
          }}
        >
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Approve" />
        </MenuItem>
        <MenuItem 
          onClick={handleDecline}
          aria-label="Decline agreement"
          sx={{ 
            py: 1,
            px: 2,
          }}
        >
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Decline" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default AgreementActionsMenu;
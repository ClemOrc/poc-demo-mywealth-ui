import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as DeclineIcon,
} from '@mui/icons-material';
import { AgreementStatus } from '../../../types';

interface AgreementActionsMenuProps {
  agreementId: string;
  agreementStatus: AgreementStatus;
  clientName: string;
  onApprove: (agreementId: string, clientName: string) => void;
  onDecline: (agreementId: string, clientName: string) => void;
}

const AgreementActionsMenu: React.FC<AgreementActionsMenuProps> = ({
  agreementId,
  agreementStatus,
  clientName,
  onApprove,
  onDecline,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
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
    event.stopPropagation();
    handleClose();
    onApprove(agreementId, clientName);
  };

  const handleDecline = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onDecline(agreementId, clientName);
  };

  // Only show menu for PENDING_APPROVAL status
  if (agreementStatus !== AgreementStatus.PENDING_APPROVAL) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="agreement actions"
        aria-controls={open ? 'agreement-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="agreement-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        onClick={(e) => e.stopPropagation()}
        MenuListProps={{
          'aria-labelledby': 'agreement-actions-button',
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
        <MenuItem onClick={handleApprove} aria-label="Approve agreement">
          <ListItemIcon>
            <ApproveIcon fontSize="small" sx={{ color: '#2e7d32' }} />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDecline} aria-label="Decline agreement">
          <ListItemIcon>
            <DeclineIcon fontSize="small" sx={{ color: '#d32f2f' }} />
          </ListItemIcon>
          <ListItemText>Decline</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AgreementActionsMenu;
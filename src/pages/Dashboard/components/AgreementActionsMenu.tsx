import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { AgreementStatus } from '../../../types';

interface AgreementActionsMenuProps {
  agreementId: string;
  status: AgreementStatus;
  onApprove: (agreementId: string) => void;
  onDecline: (agreementId: string) => void;
}

const AgreementActionsMenu: React.FC<AgreementActionsMenuProps> = ({
  agreementId,
  status,
  onApprove,
  onDecline,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Only show menu for PENDING_APPROVAL status
  if (status !== AgreementStatus.PENDING_APPROVAL) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent row click from firing
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent row click from firing
    }
    setAnchorEl(null);
  };

  const handleApprove = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onApprove(agreementId);
  };

  const handleDecline = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onDecline(agreementId);
  };

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
            bgcolor: 'action.hover',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      
      <Menu
        id="agreement-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} // Prevent row click on menu itself
        MenuListProps={{
          'aria-labelledby': 'agreement-actions-button',
          dense: true,
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
        >
          <ListItemIcon>
            <CheckCircleOutlineIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        
        <MenuItem
          onClick={handleDecline}
          aria-label="Decline agreement"
        >
          <ListItemIcon>
            <CancelOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Decline</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AgreementActionsMenu;
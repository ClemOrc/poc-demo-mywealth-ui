import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { MoreVert, CheckCircle, Cancel } from '@mui/icons-material';
import { Agreement } from '../types';

interface AgreementActionMenuProps {
  agreement: Agreement;
  onApprove: (agreement: Agreement) => void;
  onDecline: (agreement: Agreement) => void;
}

const AgreementActionMenu: React.FC<AgreementActionMenuProps> = ({
  agreement,
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
        size="small"
        onClick={handleClick}
        aria-label="actions"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} // Prevent row click on menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: 1.5,
            minWidth: 160,
            mt: 0.5,
          },
        }}
      >
        <MenuItem onClick={handleApprove} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <CheckCircle fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Approve" />
        </MenuItem>
        <MenuItem onClick={handleDecline} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Cancel fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Decline" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default AgreementActionMenu;
import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Agreement, AgreementStatus } from '../../types';

interface AgreementContextMenuProps {
  agreement: Agreement;
  onApprove: (agreement: Agreement) => void;
  onReject: (agreement: Agreement) => void;
}

const AgreementContextMenu: React.FC<AgreementContextMenuProps> = ({
  agreement,
  onApprove,
  onReject,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleApprove = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onApprove(agreement);
  };

  const handleReject = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onReject(agreement);
  };

  // Only show menu for pending agreements
  if (agreement.status !== AgreementStatus.PENDING_APPROVAL) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleApprove}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleReject}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AgreementContextMenu;
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Agreement, AgreementStatus } from '../../../types';
import { format } from 'date-fns';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { COLORS } from '../../../constants';

interface AgreementTableProps {
  agreements: Agreement[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (agreementId: string) => void;
  onStatusChange?: (agreementId: string, newStatus: AgreementStatus) => void;
}

interface ConfirmationState {
  open: boolean;
  agreementId: string | null;
  action: 'accept' | 'reject' | null;
  agreementNumber: string;
}

const AgreementTable: React.FC<AgreementTableProps> = ({
  agreements,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onStatusChange,
}) => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    open: false,
    agreementId: null,
    action: null,
    agreementNumber: '',
  });

  const getStatusColor = (status: AgreementStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const statusColors: Record<AgreementStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      [AgreementStatus.ACTIVE]: 'success',
      [AgreementStatus.PENDING_APPROVAL]: 'warning',
      [AgreementStatus.DRAFT]: 'default',
      [AgreementStatus.SUSPENDED]: 'error',
      [AgreementStatus.TERMINATED]: 'error',
      [AgreementStatus.EXPIRED]: 'default',
    };
    return statusColors[status];
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  const handleActionClick = (
    event: React.MouseEvent,
    agreementId: string,
    action: 'accept' | 'reject',
    agreementNumber: string
  ) => {
    event.stopPropagation(); // Prevent row click
    setConfirmationState({
      open: true,
      agreementId,
      action,
      agreementNumber,
    });
  };

  const handleConfirmAction = () => {
    if (confirmationState.agreementId && confirmationState.action && onStatusChange) {
      const newStatus = confirmationState.action === 'accept' 
        ? AgreementStatus.ACTIVE 
        : AgreementStatus.TERMINATED;
      
      onStatusChange(confirmationState.agreementId, newStatus);
    }
    
    setConfirmationState({
      open: false,
      agreementId: null,
      action: null,
      agreementNumber: '',
    });
  };

  const handleCancelAction = () => {
    setConfirmationState({
      open: false,
      agreementId: null,
      action: null,
      agreementNumber: '',
    });
  };

  const getConfirmationModalProps = () => {
    const isAccept = confirmationState.action === 'accept';
    return {
      title: isAccept ? 'Accepter l\'accord' : 'Refuser l\'accord',
      message: isAccept
        ? `Êtes-vous sûr de vouloir accepter l'accord ${confirmationState.agreementNumber} ? Le statut sera changé en "Valide".`
        : `Êtes-vous sûr de vouloir refuser l'accord ${confirmationState.agreementNumber} ? Le statut sera changé en "Deleted".`,
      confirmText: isAccept ? 'Accepter' : 'Refuser',
      cancelText: 'Annuler',
      confirmColor: (isAccept ? 'success' : 'error') as 'success' | 'error',
    };
  };

  if (loading && agreements.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && agreements.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No agreements found
        </Typography>
      </Box>
    );
  }

  const modalProps = getConfirmationModalProps();

  return (
    <Box>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Request Type</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Program / Subprogram</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Creation Date</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Root</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>AI Code</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Fee Group</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Created by</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Modified by</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Client Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agreements.map((agreement, index) => (
              <TableRow
                key={agreement.id || `agreement-${index}`}
                hover
                onClick={() => onRowClick(agreement.id)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f9f9f9' } }}
              >
                <TableCell>
                  <Chip
                    label={agreement.status ? agreement.status.replace('_', ' ') : 'UNKNOWN'}
                    color={getStatusColor(agreement.status as AgreementStatus)}
                    size="small"
                    sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {agreement.status === AgreementStatus.PENDING_APPROVAL ? 'Setup' : '--'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  {agreement.agreementType || 'N/A'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{formatDate(agreement.startDate)}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.agreementNumber}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.clientName || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.clientRoot || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.iaCode || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.feeGroup || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.createdBy || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.modifiedBy || 'N/A'}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{agreement.clientName || 'N/A'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {agreement.status === AgreementStatus.PENDING_APPROVAL ? (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Accepter">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, agreement.id, 'accept', agreement.agreementNumber)}
                          sx={{
                            color: '#2e7d32',
                            '&:hover': {
                              backgroundColor: 'rgba(46, 125, 50, 0.08)',
                            },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Refuser">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, agreement.id, 'reject', agreement.agreementNumber)}
                          sx={{
                            color: '#c62828',
                            '&:hover': {
                              backgroundColor: 'rgba(198, 40, 40, 0.08)',
                            },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      --
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmationState.open}
        title={modalProps.title}
        message={modalProps.message}
        confirmText={modalProps.confirmText}
        cancelText={modalProps.cancelText}
        confirmColor={modalProps.confirmColor}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </Box>
  );
};

export default AgreementTable;
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
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
} from '@mui/material';
import { Agreement, AgreementStatus } from '../../../types';
import { format } from 'date-fns';
import { UPDATE_AGREEMENT_STATUS } from '../../../graphql/mutations';
import AgreementActionMenu from '../../../components/AgreementActionMenu';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

interface AgreementTableProps {
  agreements: Agreement[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (agreementId: string) => void;
  onAgreementStatusUpdated: (agreementId: string, action: 'approve' | 'decline') => void;
  onAgreementStatusError: (error: string) => void;
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
  onAgreementStatusUpdated,
  onAgreementStatusError,
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null);

  const [updateAgreementStatus, { loading: updateLoading }] = useMutation(UPDATE_AGREEMENT_STATUS);

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

  const handleApprove = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setActionType('approve');
    setConfirmDialogOpen(true);
  };

  const handleDecline = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setActionType('decline');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAgreement || !actionType) return;

    const newStatus = actionType === 'approve' ? AgreementStatus.ACTIVE : AgreementStatus.EXPIRED;

    try {
      await updateAgreementStatus({
        variables: {
          id: selectedAgreement.id,
          status: newStatus,
        },
      });

      // Close dialog
      setConfirmDialogOpen(false);

      // Notify parent component of successful update
      onAgreementStatusUpdated(selectedAgreement.id, actionType);

      // Reset state
      setSelectedAgreement(null);
      setActionType(null);
    } catch (error: any) {
      console.error('Error updating agreement status:', error);
      setConfirmDialogOpen(false);
      onAgreementStatusError(error.message || 'Failed to update agreement status');
      setSelectedAgreement(null);
      setActionType(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
    setSelectedAgreement(null);
    setActionType(null);
  };

  const getConfirmationMessage = () => {
    if (!selectedAgreement || !actionType) return '';
    
    const actionText = actionType === 'approve' ? 'approve' : 'decline';
    const statusText = actionType === 'approve' ? 'ACTIVE' : 'EXPIRED';
    
    return `Are you sure you want to ${actionText} agreement ${selectedAgreement.agreementNumber}? The status will be updated to ${statusText}.`;
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
                    <AgreementActionMenu
                      agreement={agreement}
                      onApprove={handleApprove}
                      onDecline={handleDecline}
                    />
                  ) : (
                    <Button size="small" sx={{ textTransform: 'none', minWidth: 'auto', p: 0.5, visibility: 'hidden' }}>
                      •••
                    </Button>
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        title={actionType === 'approve' ? 'Approve Agreement' : 'Decline Agreement'}
        message={getConfirmationMessage()}
        confirmText={actionType === 'approve' ? 'Approve' : 'Decline'}
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        loading={updateLoading}
      />
    </Box>
  );
};

export default AgreementTable;
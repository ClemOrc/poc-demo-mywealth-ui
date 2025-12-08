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
} from '@mui/material';
import { Agreement, AgreementStatus } from '../../../types';
import { format } from 'date-fns';
import { AgreementContextMenu } from '../../../components/AgreementContextMenu';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { useToast } from '../../../components/Toast';
import { useMutation } from '@apollo/client';
import { APPROVE_AGREEMENT, REJECT_AGREEMENT } from '../../../graphql/mutations';
import { GET_AGREEMENTS, GET_DASHBOARD_STATS } from '../../../graphql/queries';

interface AgreementTableProps {
  agreements: Agreement[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRowClick: (agreementId: string) => void;
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
}) => {
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    agreement: Agreement | null;
  }>({
    open: false,
    type: null,
    agreement: null,
  });

  const [approveAgreement] = useMutation(APPROVE_AGREEMENT, {
    refetchQueries: [{ query: GET_AGREEMENTS }, { query: GET_DASHBOARD_STATS }],
    awaitRefetchQueries: true,
  });

  const [rejectAgreement] = useMutation(REJECT_AGREEMENT, {
    refetchQueries: [{ query: GET_AGREEMENTS }, { query: GET_DASHBOARD_STATS }],
    awaitRefetchQueries: true,
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

  const handleApproveClick = (agreement: Agreement) => {
    setConfirmModal({
      open: true,
      type: 'approve',
      agreement,
    });
  };

  const handleRejectClick = (agreement: Agreement) => {
    setConfirmModal({
      open: true,
      type: 'reject',
      agreement,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.agreement) return;

    try {
      if (confirmModal.type === 'approve') {
        await approveAgreement({
          variables: { id: confirmModal.agreement.id },
        });
        showToast(
          `Agreement ${confirmModal.agreement.agreementNumber} has been approved successfully.`,
          'success'
        );
      } else if (confirmModal.type === 'reject') {
        await rejectAgreement({
          variables: {
            id: confirmModal.agreement.id,
            reason: 'Rejected from dashboard',
          },
        });
        showToast(
          `Agreement ${confirmModal.agreement.agreementNumber} has been rejected.`,
          'info'
        );
      }
    } catch (error) {
      showToast(
        `Failed to ${confirmModal.type} agreement. Please try again.`,
        'error'
      );
      console.error(`Error ${confirmModal.type}ing agreement:`, error);
    } finally {
      setConfirmModal({ open: false, type: null, agreement: null });
    }
  };

  const handleCancelAction = () => {
    setConfirmModal({ open: false, type: null, agreement: null });
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
    <>
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
                  <TableCell>
                    <AgreementContextMenu
                      agreement={agreement}
                      onApprove={handleApproveClick}
                      onReject={handleRejectClick}
                    />
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
      </Box>

      <ConfirmationModal
        open={confirmModal.open}
        title={
          confirmModal.type === 'approve'
            ? 'Confirm Approval'
            : 'Confirm Rejection'
        }
        message={
          confirmModal.type === 'approve'
            ? `Are you sure you want to approve agreement ${confirmModal.agreement?.agreementNumber}? This will change its status to ACTIVE.`
            : `Are you sure you want to reject agreement ${confirmModal.agreement?.agreementNumber}? This will change its status to EXPIRED.`
        }
        confirmText={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
        confirmColor={confirmModal.type === 'approve' ? 'success' : 'error'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </>
  );
};

export default AgreementTable;
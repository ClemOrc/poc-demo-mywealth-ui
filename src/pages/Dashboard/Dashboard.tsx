import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import { GET_AGREEMENTS, GET_DASHBOARD_STATS } from '@graphql/queries';
import { APPROVE_AGREEMENT, DECLINE_AGREEMENT } from './mutations';
import { useAppContext } from '@contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { COLORS, DEFAULT_PAGE_SIZE } from '../../constants';
import AgreementTable from './components/AgreementTable';
import AgreementFilters from './components/AgreementFilters';
import ApprovalConfirmationDialog from './components/ApprovalConfirmationDialog';
import DeclineConfirmationDialog from './components/DeclineConfirmationDialog';
import { AgreementStatus } from '../../types';

interface ToastState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface DialogState {
  agreementId: string;
  clientName: string;
}

const Dashboard: React.FC = () => {
  const nav = useAppNavigation();
  const { filters, setFilters } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'success' });
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<DialogState | null>(null);

  // Initialize filters based on the default tab (Pending)
  React.useEffect(() => {
    setFilters({ ...filters, status: [AgreementStatus.PENDING_APPROVAL] });
  }, []); // Only run once on mount

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: 'network-only',
  });

  // WORKAROUND: Get raw stats data from store
  const [rawStatsData, setRawStatsData] = React.useState<any>(null);
  
  React.useEffect(() => {
    import('../../mocks/mockStore').then(({ getMockDashboardStats }) => {
      const mockStats = getMockDashboardStats();
      if (mockStats) {
        setRawStatsData(mockStats);
      }
    });
  }, [statsLoading]);

  const { data: agreementsData, loading: agreementsLoading, refetch } = useQuery(
    GET_AGREEMENTS,
    {
      variables: {
        filters,
        pagination: {
          page: page + 1,
          pageSize,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    }
  );

  // WORKAROUND: Get raw mock data from store (bypasses Apollo's field filtering)
  const [rawAgreementsData, setRawAgreementsData] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Import the store dynamically to get latest data
    import('../../mocks/mockStore').then(({ getMockAgreements }) => {
      const mockData = getMockAgreements();
      if (mockData) {
        setRawAgreementsData(mockData);
      }
    });
  }, [agreementsLoading, agreementsData]); // Re-fetch when query completes or data changes
  
  // Refetch when component mounts (e.g., returning from another page)
  React.useEffect(() => {
    refetch();
  }, []);

  // GraphQL Mutations
  const [approveAgreementMutation, { loading: approveLoading }] = useMutation(APPROVE_AGREEMENT, {
    onCompleted: (data) => {
      setToast({
        open: true,
        message: `Agreement ${selectedAgreement?.agreementId} approved successfully.`,
        severity: 'success',
      });
      setApproveDialogOpen(false);
      setSelectedAgreement(null);
      refetch();
      refetchStats();
    },
    onError: (error) => {
      setToast({
        open: true,
        message: `Failed to approve agreement: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [declineAgreementMutation, { loading: declineLoading }] = useMutation(DECLINE_AGREEMENT, {
    onCompleted: (data) => {
      setToast({
        open: true,
        message: `Agreement ${selectedAgreement?.agreementId} declined successfully.`,
        severity: 'success',
      });
      setDeclineDialogOpen(false);
      setSelectedAgreement(null);
      refetch();
      refetchStats();
    },
    onError: (error) => {
      setToast({
        open: true,
        message: `Failed to decline agreement: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(0);
    
    // Apply status filter based on tab
    const statusFilters: { [key: number]: AgreementStatus[] | undefined } = {
      0: [AgreementStatus.PENDING_APPROVAL], // Pending
      1: [AgreementStatus.ACTIVE], // Active
      2: [AgreementStatus.DRAFT], // Drafts
      3: [AgreementStatus.EXPIRED, AgreementStatus.TERMINATED], // Deleted
      4: undefined, // All
    };
    
    setFilters({ ...filters, status: statusFilters[newValue] });
  };

  const handleCreateAgreement = () => {
    nav.goToCreateAgreement();
  };

  const handleRowClick = (agreementId: string) => {
    nav.goToAgreementDetails(agreementId);
  };

  const handleApproveClick = (agreementId: string, clientName: string) => {
    setSelectedAgreement({ agreementId, clientName });
    setApproveDialogOpen(true);
  };

  const handleDeclineClick = (agreementId: string, clientName: string) => {
    setSelectedAgreement({ agreementId, clientName });
    setDeclineDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedAgreement) {
      approveAgreementMutation({
        variables: {
          agreementId: selectedAgreement.agreementId,
        },
      });
    }
  };

  const handleDeclineConfirm = (reason?: string) => {
    if (selectedAgreement) {
      declineAgreementMutation({
        variables: {
          agreementId: selectedAgreement.agreementId,
          reason,
        },
      });
    }
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Use raw mock data if available, otherwise fall back to Apollo data
  const agreements = rawAgreementsData?.data || agreementsData?.agreements?.data || [];
  const total = rawAgreementsData?.total || agreementsData?.agreements?.total || 0;

  interface TabCounts {
    all: number;
    active: number;
    pending: number;
    draft: number;
    deleted: number;
  }

  const getTabCounts = (): TabCounts => {
    const stats = rawStatsData || statsData?.dashboardStats;
    if (!stats) {
      return { all: 0, active: 0, pending: 0, draft: 0, deleted: 0 };
    }
    
    return {
      all: stats.totalAgreements || 0,
      active: stats.activeAgreements || 0,
      pending: stats.pendingApprovalAgreements || 0,
      draft: stats.draftAgreements || 0,
      deleted: (stats.expiredAgreements || 0) + (stats.terminatedAgreements || 0),
    };
  };

  const tabCounts = getTabCounts();

  return (
    <Box sx={{ bgcolor: COLORS.BACKGROUND_GRAY, minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateAgreement}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
          }}
        >
          Create a new agreement
        </Button>
      </Box>

      {/* Main Content Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {/* Search Section */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Search
          </Typography>
          <AgreementFilters
            filters={filters}
            onFiltersChange={setFilters}
            onRefresh={refetch}
          />
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              },
            }}
          >
            <Tab label={`Pending (${tabCounts.pending})`} />
            <Tab label={`Active (${tabCounts.active})`} />
            <Tab label={`Drafts (${tabCounts.draft})`} />
            <Tab label={`Deleted (${tabCounts.deleted})`} />
            <Tab label={`All (${tabCounts.all})`} />
          </Tabs>
        </Box>

        {/* Agreements Table */}
        <Box sx={{ p: 0 }}>
          <AgreementTable
            agreements={agreements}
            loading={agreementsLoading}
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onRowClick={handleRowClick}
            onApprove={handleApproveClick}
            onDecline={handleDeclineClick}
          />
        </Box>
      </Card>

      {/* Approval Confirmation Dialog */}
      {selectedAgreement && (
        <ApprovalConfirmationDialog
          open={approveDialogOpen}
          agreementId={selectedAgreement.agreementId}
          clientName={selectedAgreement.clientName}
          loading={approveLoading}
          onConfirm={handleApproveConfirm}
          onCancel={() => {
            setApproveDialogOpen(false);
            setSelectedAgreement(null);
          }}
        />
      )}

      {/* Decline Confirmation Dialog */}
      {selectedAgreement && (
        <DeclineConfirmationDialog
          open={declineDialogOpen}
          agreementId={selectedAgreement.agreementId}
          clientName={selectedAgreement.clientName}
          loading={declineLoading}
          onConfirm={handleDeclineConfirm}
          onCancel={() => {
            setDeclineDialogOpen(false);
            setSelectedAgreement(null);
          }}
        />
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
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
import { APPROVE_AGREEMENT, DECLINE_AGREEMENT } from '@graphql/mutations';
import { useAppContext } from '@contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { COLORS, DEFAULT_PAGE_SIZE } from '../../constants';
import AgreementTable from './components/AgreementTable';
import AgreementFilters from './components/AgreementFilters';
import ApprovalConfirmationDialog from './components/ApprovalConfirmationDialog';
import { Agreement, AgreementStatus } from '../../types';

const Dashboard: React.FC = () => {
  const nav = useAppNavigation();
  const { filters, setFilters } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'decline'>('approve');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Initialize filters based on the default tab (Pending)
  React.useEffect(() => {
    setFilters({ ...filters, status: [AgreementStatus.PENDING_APPROVAL] });
  }, []); // Only run once on mount

  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATS, {
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

  // Mutations
  const [approveAgreement, { loading: approveLoading }] = useMutation(APPROVE_AGREEMENT, {
    onCompleted: (data) => {
      const agreementId = data.approveAgreement.agreementNumber;
      setNotification({
        open: true,
        message: `Agreement ${agreementId} approved successfully`,
        severity: 'success',
      });
      refetch();
      setDialogOpen(false);
      setSelectedAgreement(null);
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Error approving agreement: ${error.message}`,
        severity: 'error',
      });
    },
  });

  const [declineAgreement, { loading: declineLoading }] = useMutation(DECLINE_AGREEMENT, {
    onCompleted: (data) => {
      const agreementId = data.declineAgreement.agreementNumber;
      setNotification({
        open: true,
        message: `Agreement ${agreementId} declined successfully`,
        severity: 'success',
      });
      refetch();
      setDialogOpen(false);
      setSelectedAgreement(null);
    },
    onError: (error) => {
      setNotification({
        open: true,
        message: `Error declining agreement: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // WORKAROUND: Get raw mock data from store (bypasses Apollo's field filtering)
  const [rawAgreementsData, setRawAgreementsData] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Import the store dynamically to get latest data
    import('../../mocks/mockStore').then(({ getMockAgreements }) => {
      const mockData = getMockAgreements();
      if (mockData) {
        console.log('✅ Got raw mock data from store:', mockData);
        setRawAgreementsData(mockData);
      }
    });
  }, [agreementsLoading, agreementsData]); // Re-fetch when query completes or data changes
  
  // Refetch when component mounts (e.g., returning from another page)
  React.useEffect(() => {
    refetch();
  }, []);

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

  const handleApprove = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const handleDecline = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    setDialogType('decline');
    setDialogOpen(true);
  };

  const handleConfirmApproval = async (reason?: string) => {
    if (!selectedAgreement) return;

    await approveAgreement({
      variables: {
        id: selectedAgreement.id,
        comments: reason,
      },
    });
  };

  const handleConfirmDecline = async (reason?: string) => {
    if (!selectedAgreement) return;

    await declineAgreement({
      variables: {
        id: selectedAgreement.id,
        reason: reason,
      },
    });
  };

  const handleDialogConfirm = (reason?: string) => {
    if (dialogType === 'approve') {
      handleConfirmApproval(reason);
    } else {
      handleConfirmDecline(reason);
    }
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setSelectedAgreement(null);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        </Box>
      </Card>

      {/* Approval/Decline Confirmation Dialog */}
      <ApprovalConfirmationDialog
        open={dialogOpen}
        type={dialogType}
        agreement={selectedAgreement}
        loading={approveLoading || declineLoading}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
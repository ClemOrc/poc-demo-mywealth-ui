import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Card,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import { GET_AGREEMENTS, GET_DASHBOARD_STATS } from '@graphql/queries';
import { useAppContext } from '@contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { COLORS, DEFAULT_PAGE_SIZE } from '../../constants';
import AgreementTable from './components/AgreementTable';
import AgreementFilters from './components/AgreementFilters';
import { Agreement, AgreementStatus } from '../../types';
import Toast from '../../components/Toast';

const Dashboard: React.FC = () => {
  const nav = useAppNavigation();
  const { filters, setFilters } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Local state for agreements (for dynamic updates)
  const [localAgreements, setLocalAgreements] = useState<Agreement[]>([]);
  const [localTotal, setLocalTotal] = useState(0);

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
        console.log('✅ Got raw mock data from store:', mockData);
        setRawAgreementsData(mockData);
        setLocalAgreements(mockData.data || []);
        setLocalTotal(mockData.total || 0);
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

  // Handler for successful agreement status update
  const handleAgreementStatusUpdated = (agreementId: string, action: 'approve' | 'decline') => {
    // Remove agreement from local list
    setLocalAgreements(prev => prev.filter(agreement => agreement.id !== agreementId));
    setLocalTotal(prev => Math.max(0, prev - 1));

    // Update stats (decrement pending count)
    if (rawStatsData) {
      setRawStatsData({
        ...rawStatsData,
        pendingApprovalAgreements: Math.max(0, (rawStatsData.pendingApprovalAgreements || 0) - 1),
        totalAgreements: rawStatsData.totalAgreements || 0,
      });
    }

    // Show success toast
    const actionText = action === 'approve' ? 'approved' : 'declined';
    setToastMessage(`Agreement ${agreementId} has been ${actionText} successfully.`);
    setToastSeverity('success');
    setToastOpen(true);

    // Refetch stats to update counters
    refetchStats();
  };

  // Handler for error during status update
  const handleAgreementStatusError = (error: string) => {
    setToastMessage(error);
    setToastSeverity('error');
    setToastOpen(true);
  };

  // Use local state for agreements (for dynamic updates without page reload)
  const agreements = localAgreements.length > 0 ? localAgreements : (rawAgreementsData?.data || agreementsData?.agreements?.data || []);
  const total = localTotal > 0 ? localTotal : (rawAgreementsData?.total || agreementsData?.agreements?.total || 0);

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
            onAgreementStatusUpdated={handleAgreementStatusUpdated}
            onAgreementStatusError={handleAgreementStatusError}
          />
        </Box>
      </Card>

      {/* Toast Notification */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;
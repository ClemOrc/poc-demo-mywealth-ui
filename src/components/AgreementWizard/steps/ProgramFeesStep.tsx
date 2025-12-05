import React from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { FormikProps } from 'formik';
import { CreateAgreementFormValues } from '../../../types';
import { GET_PROGRAM_FEES } from '@graphql/queries';
import { feeSchedules } from '../../../mocks/mockData';

type Props = FormikProps<CreateAgreementFormValues>;

const ProgramFeesStep: React.FC<Props> = ({ values, setFieldValue }) => {
  const [rawProgramFees, setRawProgramFees] = React.useState<any>(null);

  const { data, loading, error } = useQuery(GET_PROGRAM_FEES, {
    variables: { programType: values.programType },
    skip: !values.programType,
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (!loading) {
      import('../../../mocks/mockStore').then(({ getMockProgramFees }) => {
        const mockData = getMockProgramFees();
        if (mockData) {
          setRawProgramFees(mockData);
        }
      });
    }
  }, [loading]);

  // Update total household billable assets when client billable assets changes
  React.useEffect(() => {
    if (values.clientBillableAssets && values.clientBillableAssets > 0) {
      setFieldValue('totalHouseholdBillableAssets', values.clientBillableAssets);
    } else {
      setFieldValue('totalHouseholdBillableAssets', 0);
    }
  }, [values.clientBillableAssets, setFieldValue]);

  const programFee = rawProgramFees || data?.programFees;
  
  // Get fee rates based on selected schedule
  const currentFeeRates = values.feeSchedule && feeSchedules[values.feeSchedule] 
    ? feeSchedules[values.feeSchedule]
    : programFee?.feeRates || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading program fees: {error.message}
      </Alert>
    );
  }
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Program Fees
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Client billable assets in myWealth - Unified ($)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Minimum investment is ${programFee?.minAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '5,000.00'}
        </Typography>
        <TextField
          fullWidth
          type="number"
          value={values.clientBillableAssets > 0 ? values.clientBillableAssets : ''}
          onChange={(e) => {
            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
            setFieldValue('clientBillableAssets', value);
          }}
          size="small"
          sx={{ mb: 2 }}
        />
        {values.clientBillableAssets > 0 && programFee && values.clientBillableAssets < programFee.minAmount && (
          <Alert severity="error" sx={{ mb: 2 }}>
            The minimum amount required for this program is ${programFee.minAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary">
          Total household billable assets in myWEALTH - All inclusive: {values.totalHouseholdBillableAssets > 0 ? `$${values.totalHouseholdBillableAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Program Fee Type"
            value={values.programFeeType || ''}
            onChange={(e) => setFieldValue('programFeeType', e.target.value)}
            size="small"
          >
            <MenuItem value="Dynamic">Dynamic</MenuItem>
            <MenuItem value="Fixed">Fixed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
          The following fee schedule of annual rates will be applied to the above mentioned billable assets
        </Typography>
        <TextField
          fullWidth
          select
          label="Select a Fee Schedule"
          value={values.feeSchedule || ''}
          onChange={(e) => setFieldValue('feeSchedule', e.target.value)}
          size="small"
          sx={{ mb: 3 }}
        >
          <MenuItem value="UMOB">UMOB</MenuItem>
          <MenuItem value="UMOS">UMOS</MenuItem>
          <MenuItem value="Standard">Standard</MenuItem>
        </TextField>

        {values.feeSchedule && (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Assets</TableCell>
                  <TableCell align="right">Annual Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentFeeRates.map((rate: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>% on the {rate.tier}</TableCell>
                    <TableCell align="right">{rate.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {values.feeSchedule && (
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Internal Use Code: <Box component="span" sx={{ fontWeight: 400 }}>{values.feeSchedule}</Box>
            </Typography>
          </Box>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Asset allocation policy integration period"
            value={values.integrationPeriod || ''}
            onChange={(e) => setFieldValue('integrationPeriod', e.target.value)}
            size="small"
          >
            <MenuItem value="At the portfolio manager's discretion">At the portfolio manager's discretion</MenuItem>
            <MenuItem value="30 days">30 days</MenuItem>
            <MenuItem value="60 days">60 days</MenuItem>
            <MenuItem value="90 days">90 days</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Purpose of this agreement"
            value={values.purposeOfAgreement || ''}
            onChange={(e) => setFieldValue('purposeOfAgreement', e.target.value)}
            size="small"
          >
            <MenuItem value="Establish a myWealth Unified agreement">Establish a myWealth Unified agreement</MenuItem>
            <MenuItem value="Wealth accumulation">Wealth accumulation</MenuItem>
            <MenuItem value="Retirement planning">Retirement planning</MenuItem>
            <MenuItem value="Estate planning">Estate planning</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ p: 3, bgcolor: '#f5f9ff', borderRadius: 2 }}>
        <RadioGroup
          value={values.currentFeeAccount}
          onChange={(e) => setFieldValue('currentFeeAccount', e.target.value)}
        >
          <FormControlLabel
            value="yes"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  You already have a fee-based account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current fee-based account type
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={values.feeType || 'myWealth - Advisory'}
                  onChange={(e) => setFieldValue('feeType', e.target.value)}
                  size="small"
                  sx={{ mt: 1, maxWidth: 300 }}
                  disabled={values.currentFeeAccount !== 'yes'}
                >
                  <MenuItem value="myWealth - Advisory">myWealth - Advisory</MenuItem>
                  <MenuItem value="myWealth - Managed">myWealth - Managed</MenuItem>
                  <MenuItem value="myWealth - Unified">myWealth - Unified</MenuItem>
                </TextField>
              </Box>
            }
          />
          <FormControlLabel
            value="no"
            control={<Radio />}
            label="Your account is not a fee-based platform currently"
            sx={{ mt: 2 }}
          />
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default ProgramFeesStep;

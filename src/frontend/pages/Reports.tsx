import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchReportData } from '../store/actions/reportActions';
import { RootState } from '../store/types';
import { ReportType } from '../types/ReportType';
import { ReportData } from '../types/ReportData';

// Define styles for the component
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  button: {
    margin: theme.spacing(2),
  },
  chart: {
    height: 400,
  },
}));

const Reports: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Get report data from Redux store
  const reportData = useSelector((state: RootState) => state.reports.data);

  // Set up local state for selected report type and date range
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(ReportType.SALES);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7days');

  // Handle report type selection change
  const handleReportTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedReportType(event.target.value as ReportType);
  };

  // Handle date range selection change
  const handleDateRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDateRange(event.target.value as string);
  };

  // Generate the selected report
  const handleGenerateReport = async () => {
    try {
      await dispatch(fetchReportData(selectedReportType, selectedDateRange));
    } catch (error) {
      console.error('Error generating report:', error);
      // TODO: Implement error handling (e.g., show error message to user)
    }
  };

  // Fetch initial report data on component mount
  useEffect(() => {
    handleGenerateReport();
  }, []);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.formControl}>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type-select"
              value={selectedReportType}
              onChange={handleReportTypeChange}
            >
              <MenuItem value={ReportType.SALES}>Sales Report</MenuItem>
              <MenuItem value={ReportType.INVENTORY}>Inventory Report</MenuItem>
              <MenuItem value={ReportType.FULFILLMENT}>Fulfillment Report</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.formControl}>
            <InputLabel id="date-range-label">Date Range</InputLabel>
            <Select
              labelId="date-range-label"
              id="date-range-select"
              value={selectedDateRange}
              onChange={handleDateRangeChange}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            {reportData ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={reportData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body1">No data available. Generate a report to view data.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Reports;

// Human tasks:
// TODO: Implement error handling (e.g., show error message to user)
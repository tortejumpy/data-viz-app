import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsightsIcon from '@mui/icons-material/Lightbulb';
import { getDataset, getAIInsights } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AIInsights from '../components/AIInsights';
import type { AIInsightsProps } from '../components/AIInsights';

interface Dataset {
  _id: string;
  name: string;
  description?: string;
  data: Record<string, any>[];
  columns: string[];
  createdAt: string;
  fileType?: string;
  originalFilename?: string;
  aiInsights?: AIInsightsProps['insights'];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dataset-tabpanel-${index}`}
      aria-labelledby={`dataset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ViewDataset = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    fetchDataset();
  }, [id]);

  const fetchDataset = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getDataset(id);
      setDataset(response.data.dataset);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    if (!id) return;
    
    try {
      setLoadingInsights(true);
      setInsightsError('');
      console.log(`Attempting to get AI insights for dataset ID: ${id}`);
      const response = await getAIInsights(id);
      console.log('AI insights generation request successful', response.data);
      
      // Fetch the updated dataset with insights
      console.log(`Fetching updated dataset with ID: ${id} after insights generation`);
      const updatedResponse = await getDataset(id);
      setDataset(updatedResponse.data.dataset);
      console.log('Updated dataset fetched successfully', updatedResponse.data.dataset);
      
      if (updatedResponse.data.dataset && updatedResponse.data.dataset.aiInsights) {
        console.log('AI insights object found in the updated dataset.', updatedResponse.data.dataset.aiInsights);
      } else {
        console.log('Updated dataset does not contain an aiInsights object.', updatedResponse.data.dataset);
        setInsightsError('Generated insights structure not found in dataset.');
      }
    } catch (err: any) {
      console.error('Error generating or fetching AI insights:', err.response?.data || err.message || err);
      setInsightsError(err.response?.data?.message || 'Failed to get AI insights. Please check the server.');
    } finally {
      setLoadingInsights(false);
      console.log('Finished AI insights process.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getChartData = (dataset: Dataset, limit = 10): Record<string, any>[] => {
    if (!dataset.data || !dataset.data.length) return [];
    
    // Get first 10 rows for simplicity
    return dataset.data.slice(0, limit);
  };

  const getNumericColumns = (dataset: Dataset): string[] => {
    if (!dataset.data || !dataset.data.length) return [];
    
    // Find columns with numeric values
    return dataset.columns.filter(column => {
      return typeof dataset.data[0][column] === 'number';
    });
  };

  const getCategoricalColumns = (dataset: Dataset): string[] => {
    if (!dataset.data || !dataset.data.length) return [];
    
    // Find columns with categorical values
    return dataset.columns.filter(column => {
      return typeof dataset.data[0][column] === 'string';
    });
  };

  const getFrequencyData = (dataset: Dataset, column: string): { name: string; value: number }[] => {
    if (!dataset.data || !dataset.data.length) return [];
    
    // Calculate frequencies for categorical data
    const frequencies: Record<string, number> = {};
    
    dataset.data.forEach(row => {
      const value = String(row[column]);
      frequencies[value] = (frequencies[value] || 0) + 1;
    });
    
    return Object.entries(frequencies)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Get top 10
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dataset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Dataset not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const numericColumns = getNumericColumns(dataset);
  const categoricalColumns = getCategoricalColumns(dataset);
  const chartData = getChartData(dataset);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {dataset.name}
        </Typography>
        {dataset.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {dataset.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={`${dataset.data.length} rows`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${dataset.columns.length} columns`}
            color="primary"
            variant="outlined"
          />
          {dataset.fileType && (
            <Chip
              label={dataset.fileType.toUpperCase()}
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TableChartIcon />} label="Data" />
          <Tab icon={<BarChartIcon />} label="Visualize" />
          <Tab icon={<InsightsIcon />} label="AI Insights" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {dataset.columns.map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataset.data.slice(0, 100).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {dataset.columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {String(row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {dataset.data.length > 100 && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
              Showing 100 of {dataset.data.length} rows
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {numericColumns.length === 0 && categoricalColumns.length === 0 ? (
            <Alert severity="info">
              No suitable columns found for visualization. The dataset needs numeric or categorical columns.
            </Alert>
          ) : (
            <Grid container spacing={4}>
              {/* Bar Chart for numeric data */}
              {numericColumns.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Bar Chart - {numericColumns[0]}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={dataset.columns[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey={numericColumns[0]}
                          fill="#8884d8"
                          name={numericColumns[0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              )}

              {/* Line Chart for numeric data */}
              {numericColumns.length > 1 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Line Chart - {numericColumns[1]}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={dataset.columns[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={numericColumns[1]}
                          stroke="#82ca9d"
                          name={numericColumns[1]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              )}

              {/* Pie Chart for categorical data */}
              {categoricalColumns.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Distribution - {categoricalColumns[0]}
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getFrequencyData(dataset, categoricalColumns[0])}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getFrequencyData(dataset, categoricalColumns[0]).map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {!dataset.aiInsights ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No AI insights available yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Get AI-powered insights based on your dataset patterns and trends
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGetInsights}
                disabled={loadingInsights}
                startIcon={loadingInsights ? <CircularProgress size={20} /> : <InsightsIcon />}
              >
                {loadingInsights ? 'Analyzing...' : 'Generate AI Insights'}
              </Button>
              {insightsError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {insightsError}
                </Alert>
              )}
            </Box>
          ) : (
            <AIInsights insights={dataset.aiInsights} />
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ViewDataset; 
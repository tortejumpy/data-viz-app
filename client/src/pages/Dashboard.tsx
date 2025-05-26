import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Box,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import { getUserDatasets, deleteDataset } from '../services/api';

interface Dataset {
  _id: string;
  name: string;
  description?: string;
  columns: string[];
  createdAt: string;
  fileType?: string;
  originalFilename?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await getUserDatasets();
      setDatasets(response.data.datasets);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      try {
        await deleteDataset(id);
        setDatasets(datasets.filter((dataset) => dataset._id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete dataset');
      }
    }
  };

  const handleViewDataset = (id: string) => {
    navigate(`/dataset/${id}`);
  };

  const handleUploadNew = () => {
    navigate('/upload');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Your Datasets
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadNew}
        >
          Upload New Dataset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
          }}
        >
          <CircularProgress />
        </Box>
      ) : datasets.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            You don't have any datasets yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Upload a dataset to start visualizing and analyzing your data
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadNew}
            sx={{ mt: 2 }}
          >
            Upload Dataset
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {datasets.map((dataset) => (
            <Grid item xs={12} sm={6} md={4} key={dataset._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" noWrap gutterBottom>
                    {dataset.name}
                  </Typography>
                  {dataset.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1.5,
                      }}
                    >
                      {dataset.description}
                    </Typography>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Columns: {dataset.columns.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(dataset.createdAt).toLocaleDateString()}
                  </Typography>
                  {dataset.fileType && (
                    <Typography variant="body2" color="text.secondary">
                      File Type: {dataset.fileType.toUpperCase()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewDataset(dataset._id)}
                  >
                    View & Analyze
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteDataset(dataset._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 
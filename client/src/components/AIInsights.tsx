import { useState } from 'react';
import { 
  Typography, Paper, Box, Tab, Tabs, Grid, Divider, Chip, 
  Card, CardContent, List, ListItem, ListItemIcon, ListItemText, 
  Accordion, AccordionSummary, AccordionDetails, useTheme, alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsIcon from '@mui/icons-material/Insights';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/Storage';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export interface AIInsightsProps {
  insights: {
    summary?: string;
    correlations?: Array<{
      feature1: string;
      feature2: string;
      score: number;
      description: string;
    }>;
    trends?: Array<{
      feature: string;
      direction: 'up' | 'down' | 'stable';
      magnitude: number;
      description: string;
      data?: Array<{ x: number | string; y: number }>;
    }>;
    anomalies?: Array<{
      feature: string;
      value: number;
      expected: number;
      severity: 'low' | 'medium' | 'high';
      description: string;
      index?: number;
    }>;
    predictions?: Array<{
      feature: string;
      current: number;
      predicted: number;
      confidence: number;
      timeline: Array<{ time: string; value: number }>;
      description: string;
    }>;
    clusters?: Array<{
      id: number;
      size: number;
      features: Array<{ name: string; importance: number }>;
      description: string;
    }>;
    statistics?: Array<{
      feature: string;
      mean?: number;
      median?: number;
      min?: number;
      max?: number;
      stdDev?: number;
    }>;
  };
}

const AIInsights = ({ insights }: AIInsightsProps) => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  if (!insights || Object.keys(insights).length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Typography variant="h6" color="textSecondary" align="center">
          No AI insights available
        </Typography>
      </Paper>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return theme.palette.info.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'high':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getCorrelationColor = (score: number) => {
    const absScore = Math.abs(score);
    if (absScore > 0.7) return theme.palette.error.main;
    if (absScore > 0.4) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\.00$/, '');
  };

  return (
    <Paper sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
      <Box sx={{ 
        p: 2, 
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" color="textPrimary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <InsightsIcon sx={{ mr: 1 }} />
          AI Insights & Analysis
        </Typography>
        {insights.summary && (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            {insights.summary}
          </Typography>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="AI insights tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            },
          }}
        >
          {insights.trends && insights.trends.length > 0 && (
            <Tab icon={<TrendingUpIcon />} label="Trends" iconPosition="start" />
          )}
          {insights.anomalies && insights.anomalies.length > 0 && (
            <Tab icon={<WarningIcon />} label="Anomalies" iconPosition="start" />
          )}
          {insights.predictions && insights.predictions.length > 0 && (
            <Tab icon={<TimelineIcon />} label="Predictions" iconPosition="start" />
          )}
          {insights.correlations && insights.correlations.length > 0 && (
            <Tab icon={<ShowChartIcon />} label="Correlations" iconPosition="start" />
          )}
          {insights.clusters && insights.clusters.length > 0 && (
            <Tab icon={<StorageIcon />} label="Clusters" iconPosition="start" />
          )}
          {insights.statistics && insights.statistics.length > 0 && (
            <Tab icon={<AutoGraphIcon />} label="Statistics" iconPosition="start" />
          )}
        </Tabs>
      </Box>

      {/* Trends Tab */}
      {insights.trends && (
        <TabPanel value={tabIndex} index={0}>
          <Grid container spacing={3}>
            {insights.trends.map((trend, index) => (
              <Grid item xs={12} md={6} key={`trend-${index}`}>
                <Card sx={{ height: '100%', boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {trend.feature}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {trend.direction === 'up' ? (
                            <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                          ) : trend.direction === 'down' ? (
                            <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 0.5 }} />
                          ) : (
                            <ShowChartIcon sx={{ color: theme.palette.info.main, mr: 0.5 }} />
                          )}
                          <Typography variant="body2" color="textSecondary">
                            {trend.direction === 'up' 
                              ? `Increasing (${formatNumber(trend.magnitude)}%)` 
                              : trend.direction === 'down' 
                                ? `Decreasing (${formatNumber(trend.magnitude)}%)` 
                                : 'Stable trend'}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={trend.direction === 'up' ? 'Upward' : trend.direction === 'down' ? 'Downward' : 'Stable'}
                        color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'info'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {trend.description}
                    </Typography>
                    
                    {trend.data && trend.data.length > 0 && (
                      <Box sx={{ height: 200, mt: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trend.data}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis 
                              dataKey="x" 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="y"
                              name={trend.feature}
                              stroke={trend.direction === 'up' 
                                ? theme.palette.success.main 
                                : trend.direction === 'down' 
                                  ? theme.palette.error.main 
                                  : theme.palette.info.main}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}

      {/* Anomalies Tab */}
      {insights.anomalies && (
        <TabPanel value={tabIndex} index={1}>
          <Grid container spacing={3}>
            {insights.anomalies.map((anomaly, index) => (
              <Grid item xs={12} md={6} key={`anomaly-${index}`}>
                <Card sx={{ 
                  height: '100%', 
                  boxShadow: theme.shadows[1],
                  border: `1px solid ${alpha(getSeverityColor(anomaly.severity), 0.3)}`
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {anomaly.feature}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)} Severity`}
                        sx={{ 
                          backgroundColor: alpha(getSeverityColor(anomaly.severity), 0.1),
                          color: getSeverityColor(anomaly.severity),
                          fontWeight: 500
                        }}
                        size="small"
                        icon={<WarningIcon />}
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Anomalous Value
                        </Typography>
                        <Typography variant="body1" fontWeight={500} color="error">
                          {formatNumber(anomaly.value)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Expected Range
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatNumber(anomaly.expected)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="body2">
                      {anomaly.description}
                    </Typography>
                    
                    {anomaly.index !== undefined && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          Found at index: {anomaly.index}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}

      {/* Predictions Tab */}
      {insights.predictions && (
        <TabPanel value={tabIndex} index={2}>
          <Grid container spacing={3}>
            {insights.predictions.map((prediction, index) => (
              <Grid item xs={12} key={`prediction-${index}`}>
                <Card sx={{ boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {prediction.feature} Prediction
                        </Typography>
                      </Box>
                      <Chip
                        label={`${Math.round(prediction.confidence * 100)}% Confidence`}
                        color={prediction.confidence > 0.7 ? 'success' : prediction.confidence > 0.4 ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          Current Value
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatNumber(prediction.current)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="caption" color="textSecondary">
                          Predicted Value
                        </Typography>
                        <Typography variant="body1" fontWeight={500} color="primary">
                          {formatNumber(prediction.predicted)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="textSecondary">
                          Insight
                        </Typography>
                        <Typography variant="body2">
                          {prediction.description}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {prediction.timeline && prediction.timeline.length > 0 && (
                      <Box sx={{ height: 250, mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Forecast Timeline
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={prediction.timeline}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name={prediction.feature}
                              stroke={theme.palette.primary.main}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}
      
      {/* Correlations Tab */}
      {insights.correlations && (
        <TabPanel value={tabIndex} index={3}>
          <List sx={{ mb: 2 }}>
            {insights.correlations.map((correlation, index) => (
              <Card 
                key={`correlation-${index}`} 
                sx={{ 
                  mb: 2, 
                  boxShadow: theme.shadows[1],
                  border: `1px solid ${alpha(getCorrelationColor(correlation.score), 0.3)}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Correlation between <b>{correlation.feature1}</b> and <b>{correlation.feature2}</b>
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.abs(correlation.score).toFixed(2)} ${correlation.score > 0 ? 'Positive' : 'Negative'}`}
                      sx={{ 
                        backgroundColor: alpha(getCorrelationColor(correlation.score), 0.1),
                        color: getCorrelationColor(correlation.score),
                        fontWeight: 500
                      }}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    {correlation.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        </TabPanel>
      )}
      
      {/* Clusters Tab */}
      {insights.clusters && (
        <TabPanel value={tabIndex} index={4}>
          {insights.clusters.map((cluster, index) => (
            <Accordion 
              key={`cluster-${index}`} 
              sx={{ 
                mb: 2, 
                boxShadow: theme.shadows[1],
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`cluster-${index}-content`}
                id={`cluster-${index}-header`}
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                    Cluster {cluster.id}
                  </Typography>
                  <Chip
                    label={`${cluster.size} records`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {cluster.description}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Key Features:
                </Typography>
                <Grid container spacing={1}>
                  {cluster.features.map((feature, featureIndex) => (
                    <Grid item xs={12} sm={6} md={4} key={`cluster-${index}-feature-${featureIndex}`}>
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1
                      }}>
                        <Box sx={{ 
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: `rgba(33, 150, 243, ${0.3 + 0.7 * feature.importance})`,
                          mr: 1
                        }} />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {feature.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {(feature.importance * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
      )}
      
      {/* Statistics Tab */}
      {insights.statistics && (
        <TabPanel value={tabIndex} index={5}>
          <Grid container spacing={3}>
            {insights.statistics.map((stat, index) => (
              <Grid item xs={12} md={6} key={`stat-${index}`}>
                <Card sx={{ boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      {stat.feature}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {stat.mean !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Mean
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatNumber(stat.mean)}
                          </Typography>
                        </Grid>
                      )}
                      
                      {stat.median !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Median
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatNumber(stat.median)}
                          </Typography>
                        </Grid>
                      )}
                      
                      {stat.min !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Min
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatNumber(stat.min)}
                          </Typography>
                        </Grid>
                      )}
                      
                      {stat.max !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Max
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatNumber(stat.max)}
                          </Typography>
                        </Grid>
                      )}
                      
                      {stat.stdDev !== undefined && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="textSecondary">
                            Standard Deviation
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatNumber(stat.stdDev)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      )}
    </Paper>
  );
};

export default AIInsights; 
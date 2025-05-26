import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Box, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel, useTheme, alpha } from '@mui/material';

// Custom tooltip with a sleek design
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          padding: '10px',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography 
            key={`item-${index}`}
            variant="body2" 
            color="textPrimary"
            sx={{ 
              fontWeight: 500,
              color: entry.color
            }}
          >
            {`${entry.name}: ${entry.value}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Get a palette of colors from a base color
const getColorPalette = (baseColor: string, count: number) => {
  const palette = [];
  for (let i = 0; i < count; i++) {
    // Generate variations of the base color
    palette.push(alpha(baseColor, 0.5 + (0.5 * i / count)));
  }
  return palette;
};

interface DataVisualizationProps {
  data: any[];
  columns: string[];
  chartType?: string;
}

const DataVisualization = ({ data, columns, chartType = 'bar' }: DataVisualizationProps) => {
  const theme = useTheme();
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [xAxis, setXAxis] = useState(columns[0] || '');
  const [yAxis, setYAxis] = useState(columns[1] || '');
  
  useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      setXAxis(columns[0]);
    }
    if (columns.length > 1 && !yAxis) {
      setYAxis(columns[1]);
    }
  }, [columns]);

  // Check if data is numeric for a given column
  const isNumeric = (column: string) => {
    return data.length > 0 && typeof data[0][column] === 'number';
  };

  // Get numeric columns
  const numericColumns = columns.filter(isNumeric);
  
  // Prepare data for visualization
  const prepareData = () => {
    // For pie charts, we need to aggregate the data
    if (selectedChart === 'pie') {
      // Create a frequency map
      const frequencyMap = data.reduce((acc, item) => {
        const key = String(item[xAxis]);
        acc[key] = (acc[key] || 0) + (isNumeric(yAxis) ? Number(item[yAxis]) : 1);
        return acc;
      }, {} as Record<string, number>);
      
      // Convert the frequency map to an array
      return Object.entries(frequencyMap).map(([name, value]) => ({ name, value }));
    }
    
    // For other charts, just map the data
    return data.map(item => ({
      name: item[xAxis],
      value: isNumeric(yAxis) ? Number(item[yAxis]) : 0,
      // Add more metrics for multi-series charts
      ...(numericColumns.reduce((acc, col) => {
        if (col !== xAxis) {
          acc[col] = Number(item[col]);
        }
        return acc;
      }, {} as Record<string, number>))
    }));
  };

  const visualizationData = prepareData();
  
  // Generate color palette
  const COLORS = getColorPalette(theme.palette.primary.main, 10);
  
  // Render the selected chart type
  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={visualizationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name={yAxis} fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={visualizationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={yAxis} 
                stroke={theme.palette.primary.main} 
                strokeWidth={2}
                dot={{ fill: theme.palette.primary.main, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={visualizationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                name={yAxis} 
                stroke={theme.palette.primary.main}
                fillOpacity={0.6}
                fill={alpha(theme.palette.primary.main, 0.2)}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={visualizationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill={theme.palette.primary.main}
                dataKey="value"
              >
                {visualizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="name" 
                name={xAxis} 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                dataKey="value" 
                name={yAxis} 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={visualizationData} fill={theme.palette.primary.main} />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      case 'radar':
        const radarData = visualizationData.slice(0, 8); // Limit to avoid clutter
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <PolarRadiusAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
              <Radar 
                name={yAxis} 
                dataKey="value" 
                stroke={theme.palette.primary.main} 
                fill={alpha(theme.palette.primary.main, 0.6)} 
                fillOpacity={0.6} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
      <Typography variant="h5" gutterBottom color="textPrimary" sx={{ fontWeight: 600, mb: 3 }}>
        Data Visualization
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              label="Chart Type"
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="scatter">Scatter Plot</MenuItem>
              <MenuItem value="radar">Radar Chart</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>X Axis</InputLabel>
            <Select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              label="X Axis"
            >
              {columns.map((column) => (
                <MenuItem key={column} value={column}>{column}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Y Axis</InputLabel>
            <Select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              label="Y Axis"
            >
              {columns.map((column) => (
                <MenuItem key={column} value={column}>{column}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box 
        sx={{ 
          height: 450, 
          backgroundColor: alpha(theme.palette.background.default, 0.6),
          borderRadius: 1,
          p: 2
        }}
      >
        {data.length > 0 ? renderChart() : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="textSecondary">
              No data available for visualization
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default DataVisualization; 
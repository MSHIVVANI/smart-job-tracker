import { Paper, Grid, Typography, Box, Card, Divider } from '@mui/material';
import StatusDonutChart from './StatusDonutChart';
import ActivityLineChart from './ActivityLineChart';
import ConversionFunnelChart from './ConversionFunnelChart';
import StatusTrendsChart from './StatusTrendsChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ 
      p: 3, 
      height: '100%', 
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
      borderRadius: 4,
      border: '1px solid #eff2f5',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.8 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: '12px', 
          backgroundColor: `${color}10`, 
          color: color,
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
    </Card>
  );
}

function AnalyticsDashboard({ applications }) {
  const total = applications.length;
  const interviewing = applications.filter(a => a.status === 'Interviewing').length;
  const offers = applications.filter(a => a.status === 'Offer' || a.status === 'Accepted').length;
  const responseRate = total > 0 ? (((total - applications.filter(a => a.status === 'Applied' || a.status === 'Discovered').length) / total) * 100).toFixed(0) : 0;

  return (
    <Box sx={{ flexGrow: 1, pb: 4, width: '100%' }}>
      {/* Top Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Pipeline" value={total} icon={<AssignmentIcon />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Interviews" value={interviewing} icon={<ScheduleIcon />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Offers" value={offers} icon={<CheckCircleIcon />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Success Rate" value={`${responseRate}%`} icon={<TrendingUpIcon />} color="#8b5cf6" />
        </Grid>
      </Grid>

      {/* Main Insights Grid - 2x2 Layout to fill the whole space */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '480px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Current Status Distribution</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Real-time breakdown of your pipeline</Typography>
            <Box sx={{ flexGrow: 1 }}><StatusDonutChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '480px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Application Search Funnel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Conversion rates across stages</Typography>
            <Box sx={{ flexGrow: 1 }}><ConversionFunnelChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '480px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Activity Velocity</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Monthly volume of new tracked jobs</Typography>
            <Box sx={{ flexGrow: 1 }}><ActivityLineChart data={applications} /></Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, height: '480px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Pipeline Trends</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Outcome distribution over time</Typography>
            <Box sx={{ flexGrow: 1 }}><StatusTrendsChart data={applications} /></Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AnalyticsDashboard;